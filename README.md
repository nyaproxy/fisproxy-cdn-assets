# fisproxy-cdn-assets

Published static assets for the FisProxy front-ends. This repository contains **no source code** — it is a
delivery channel for build output that is then served through jsDelivr mirrors:

- primary `https://cdn.jsdmirror.com/gh/nyaproxy/fisproxy-cdn-assets@<tag>/<path>`
- fallback `https://jsd.onmicrosoft.cn/gh/nyaproxy/fisproxy-cdn-assets@<tag>/<path>`

Both mirrors proxy GitHub byte for byte and send `access-control-allow-origin: *`, so a single
`integrity="sha384-…"` value is valid on either host.

## Layout

Every release is one tag. Tags carry the site name so one repository can serve several front-ends:

| Site | Tag | Published paths |
| --- | --- | --- |
| `fisproxy-shop` | `shop-<sha7>` | `shop/assets/**` |
| `fisproxy-ng` (public web build) | `web-<sha7>` | `web/assets/**` |
| `fisproxy-wiki` | `wiki-<sha7>` | `wiki/_next/static/**` |

`<sha7>` is the 7 character short commit SHA of the site repository the assets were built from. A tag is
immutable: it is created once by `.github/workflows/publish.yml` and never moved, which is what keeps the
mirrors from serving a stale bundle. Old tags are pruned by the same run (`keep_tags`, default 3).
Set `keep_tags: 0` to retain all tags. The shop uses this setting because retained origin releases
still import their matching CDN release. Deploy the publisher's zero-retention support before enabling
this setting in a caller; the older publisher treats zero as pruning every previous tag.

Each tag contains `manifest.json` next to the files:

```json
{
  "site": "shop",
  "tag": "shop-1a2b3c4",
  "commit": "1a2b3c4d5e6f…",
  "generatedAt": "2026-09-22T10:00:00.000Z",
  "files": {
    "shop/assets/root-DRT8frXD.js": { "sha384": "…", "bytes": 12345 }
  }
}
```

The site build fetches this manifest (bounded retry) and uses it to emit CDN URLs and
`integrity`/`crossorigin` attributes. If the manifest for the commit being deployed is not published yet, the
site build falls back to same-origin asset URLs instead of failing.

## What must not be published here

This repository is public. Privileged or management bundles stay on their own origin:

- `fisproxy-ng` publishes only `web/dist/assets`; `web/.privileged-dist` (served through authenticated
  `/api/v1/web-assets/*`) is never uploaded.
- `fisproxy-shop` keeps its admin route chunks on the origin and only publishes the public chunks.

## Publishing

Site repositories call `.github/workflows/publish.yml` (workflow_call) with `site`, `tag`, `source_dir` and
`repo_dir`, passing a token that may push here as `secrets.token`. The publish implementation lives in
`tools/publish-assets.mjs` and can also be run locally for a dry run.

Commits in this repository are authored and committed as `f1sunia <289944096+F1sunia@users.noreply.github.com>`.
