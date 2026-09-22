#!/usr/bin/env node
// Copies one build output directory into this repository under a new immutable tag and writes the
// manifest the site builds read back. Single implementation for every front-end; see README.md.
import { createHash } from "node:crypto"
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { dirname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const AUTHOR_NAME = "f1sunia"
const AUTHOR_EMAIL = "289944096+F1sunia@users.noreply.github.com"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")

function parseArgs(argv) {
  const args = { keepTags: 3, dryRun: false, commit: "" }
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    const value = argv[index + 1]
    switch (key) {
      case "--site": args.site = value; index += 1; break
      case "--tag": args.tag = value; index += 1; break
      case "--source-dir": args.sourceDir = value; index += 1; break
      case "--repo-dir": args.repoDir = value; index += 1; break
      case "--commit": args.commit = value; index += 1; break
      case "--keep-tags": args.keepTags = Number(value); index += 1; break
      case "--dry-run": args.dryRun = true; break
      default: throw new Error(`unknown argument ${key}`)
    }
  }
  for (const required of ["site", "tag", "sourceDir", "repoDir"]) {
    if (!args[required]) throw new Error(`missing --${required.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`)
  }
  if (!/^[a-z0-9-]+$/.test(args.site)) throw new Error(`invalid site: ${args.site}`)
  // GitHub expression context cannot slice a SHA, so callers may pass "<site>-<full sha>";
  // tags are always normalised to <site>-<sha7> to match what the site builds resolve.
  const [sitePrefix, ...rest] = args.tag.split("-")
  const sha = rest.join("-")
  if (sitePrefix !== args.site || !/^[0-9a-f]{7,40}$/.test(sha)) {
    throw new Error(`tag must be <site>-<sha>, got ${args.tag}`)
  }
  args.tag = `${args.site}-${sha.slice(0, 7)}`
  if (!existsSync(resolve(args.sourceDir))) throw new Error(`source directory not found: ${args.sourceDir}`)
  return args
}

function git(args, options = {}) {
  const result = execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", stdio: options.stdio ?? "pipe", env: options.env })
  return result === null ? "" : String(result).trim()
}

function listFiles(root) {
  const files = []
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (entry.isFile()) files.push(path)
    }
  }
  walk(root)
  return files.sort()
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const sourceDir = resolve(args.sourceDir)
  const targetDir = join(repoRoot, args.repoDir)

  const tagExists = git(["tag", "--list", args.tag]) !== ""
  if (tagExists && !args.dryRun) {
    throw new Error(`tag ${args.tag} already exists; assets are immutable per commit`)
  }

  rmSync(targetDir, { force: true, recursive: true })
  mkdirSync(targetDir, { recursive: true })
  for (const file of listFiles(sourceDir)) {
    const destination = join(targetDir, relative(sourceDir, file))
    mkdirSync(dirname(destination), { recursive: true })
    cpSync(file, destination)
  }

  const files = {}
  let totalBytes = 0
  for (const file of listFiles(join(repoRoot, args.site))) {
    if (file.endsWith(`${sep}manifest.json`)) continue
    const relativePath = relative(repoRoot, file).split(sep).join("/")
    const contents = readFileSync(file)
    totalBytes += contents.byteLength
    files[relativePath] = {
      sha384: createHash("sha384").update(contents).digest("base64"),
      bytes: contents.byteLength,
    }
  }

  const manifest = {
    site: args.site,
    tag: args.tag,
    commit: args.commit,
    generatedAt: new Date().toISOString(),
    files,
  }
  writeFileSync(join(repoRoot, args.site, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)

  const count = Object.keys(files).length
  console.log(`${args.repoDir}: ${count} files, ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`)
  if (args.dryRun) {
    console.log(`dry run: wrote manifest only (${join(args.site, "manifest.json")})`)
    return
  }

  git(["add", "--all", args.site])
  const status = git(["status", "--porcelain"])
  if (status === "") {
    console.log("nothing to publish; assets unchanged")
    return
  }
  git(["-c", "commit.gpgsign=false", "commit", "-m", `${args.site}: publish ${args.tag}`], {
    stdio: "inherit",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: AUTHOR_NAME,
      GIT_AUTHOR_EMAIL: AUTHOR_EMAIL,
      GIT_COMMITTER_NAME: AUTHOR_NAME,
      GIT_COMMITTER_EMAIL: AUTHOR_EMAIL,
    },
  })
  git(["-c", "tag.gpgsign=false", "tag", args.tag, "-m", `${args.site} ${args.tag}`])
  git(["push", "origin", "HEAD:main"])
  git(["push", "origin", `refs/tags/${args.tag}`])
  console.log(`published ${args.tag}`)

  pruneTags(args.site, args.tag, args.keepTags)
}

function pruneTags(site, currentTag, keepTags) {
  const existing = git(["tag", "--list", `${site}-*`, "--sort=-creatordate"])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const stale = existing.filter((tag) => tag !== currentTag).slice(Math.max(keepTags - 1, 0))
  for (const tag of stale) {
    git(["push", "origin", `:refs/tags/${tag}`])
    git(["tag", "-d", tag])
    console.log(`pruned ${tag}`)
  }
  console.log(`kept ${existing.length - stale.length} of ${existing.length} ${site} tags`)
}

main()
