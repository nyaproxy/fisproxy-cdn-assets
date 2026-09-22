import{I as e,R as t,t as n}from"./jsx-runtime-BgZQ8hu9.js";import{a as r}from"./dist-CzIHclVJ.js";var i=t(e(),1),a=n(),o=`#version 300 es
in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,s=`#version 300 es
precision highp float;

uniform vec2 resolution;
uniform float time;

out vec4 outputColor;

vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float cnoise(vec2 p) {
  vec4 pi = floor(p.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 pf = fract(p.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  pi = mod289(pi);
  vec4 ix = pi.xzxz;
  vec4 iy = pi.yyww;
  vec4 fx = pf.xzxz;
  vec4 fy = pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fadeXY = fade(pf.xy);
  vec2 nx = mix(vec2(n00, n01), vec2(n10, n11), fadeXY.x);
  return 2.3 * mix(nx.x, nx.y, fadeXY.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 1.0;
  float frequency = 3.0;

  for (int i = 0; i < 4; i++) {
    value += amplitude * abs(cnoise(p));
    p *= frequency;
    amplitude *= 0.3;
  }

  return value;
}

float bayer(vec2 coord) {
  int x = int(mod(coord.x, 8.0));
  int y = int(mod(coord.y, 8.0));
  int index = y * 8 + x;

  float matrix[64];
  matrix[0] = 0.0; matrix[1] = 48.0; matrix[2] = 12.0; matrix[3] = 60.0; matrix[4] = 3.0; matrix[5] = 51.0; matrix[6] = 15.0; matrix[7] = 63.0;
  matrix[8] = 32.0; matrix[9] = 16.0; matrix[10] = 44.0; matrix[11] = 28.0; matrix[12] = 35.0; matrix[13] = 19.0; matrix[14] = 47.0; matrix[15] = 31.0;
  matrix[16] = 8.0; matrix[17] = 56.0; matrix[18] = 4.0; matrix[19] = 52.0; matrix[20] = 11.0; matrix[21] = 59.0; matrix[22] = 7.0; matrix[23] = 55.0;
  matrix[24] = 40.0; matrix[25] = 24.0; matrix[26] = 36.0; matrix[27] = 20.0; matrix[28] = 43.0; matrix[29] = 27.0; matrix[30] = 39.0; matrix[31] = 23.0;
  matrix[32] = 2.0; matrix[33] = 50.0; matrix[34] = 14.0; matrix[35] = 62.0; matrix[36] = 1.0; matrix[37] = 49.0; matrix[38] = 13.0; matrix[39] = 61.0;
  matrix[40] = 34.0; matrix[41] = 18.0; matrix[42] = 46.0; matrix[43] = 30.0; matrix[44] = 33.0; matrix[45] = 17.0; matrix[46] = 45.0; matrix[47] = 29.0;
  matrix[48] = 10.0; matrix[49] = 58.0; matrix[50] = 6.0; matrix[51] = 54.0; matrix[52] = 9.0; matrix[53] = 57.0; matrix[54] = 5.0; matrix[55] = 53.0;
  matrix[56] = 42.0; matrix[57] = 26.0; matrix[58] = 38.0; matrix[59] = 22.0; matrix[60] = 41.0; matrix[61] = 25.0; matrix[62] = 37.0; matrix[63] = 21.0;

  return matrix[index] / 64.0;
}

void main() {
  float pixelSize = 1.0;
  float backgroundMerge = 2.0;
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 scaledCoord = floor(uv * resolution / pixelSize);
  vec2 backgroundCoord = floor(scaledCoord / backgroundMerge);
  vec2 backgroundPixelCoord = (backgroundCoord * backgroundMerge + backgroundMerge * 0.5) * pixelSize;
  vec2 backgroundUv = backgroundPixelCoord / resolution;
  vec2 p = backgroundUv - 0.5;
  p.x *= resolution.x / resolution.y;

  float noiseValue = fbm(p + fbm(p - time * 0.05));
  float density = clamp(noiseValue * 0.74 - 0.13, 0.0, 1.0);
  float dot = step(bayer(backgroundCoord), density);
  vec3 color = vec3(0.3098) * dot * 0.42;

  outputColor = vec4(color, 1.0);
}
`;function c(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function l({className:e}){let t=(0,i.useRef)(null);return(0,i.useEffect)(()=>{let e=t.current;if(!e)return;let n=e.getContext(`webgl2`,{alpha:!1,antialias:!1,depth:!1,powerPreference:`low-power`,preserveDrawingBuffer:!1,stencil:!1});if(!n)return;let r=e,i=n,a=c(n,n.VERTEX_SHADER,o),l=c(n,n.FRAGMENT_SHADER,s);if(!a||!l){a&&n.deleteShader(a),l&&n.deleteShader(l);return}let u=n.createProgram();if(!u){n.deleteShader(a),n.deleteShader(l);return}if(n.attachShader(u,a),n.attachShader(u,l),n.linkProgram(u),n.deleteShader(a),n.deleteShader(l),!n.getProgramParameter(u,n.LINK_STATUS)){n.deleteProgram(u);return}let d=n.createBuffer(),f=n.getAttribLocation(u,`position`);if(!d||f<0){d&&n.deleteBuffer(d),n.deleteProgram(u);return}let p=n.getUniformLocation(u,`resolution`),m=n.getUniformLocation(u,`time`),h=window.matchMedia(`(prefers-reduced-motion: reduce)`),g=performance.now(),_=0,v=!0,y=h.matches;n.useProgram(u),n.bindBuffer(n.ARRAY_BUFFER,d),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),n.STATIC_DRAW),n.enableVertexAttribArray(f),n.vertexAttribPointer(f,2,n.FLOAT,!1,0,0),n.disable(n.BLEND),n.disable(n.DEPTH_TEST);function b(){let e=Math.floor(r.clientWidth),t=Math.floor(r.clientHeight);return e<1||t<1?!1:((r.width!==e||r.height!==t)&&(r.width=e,r.height=t),i.useProgram(u),i.viewport(0,0,e,t),i.uniform2f(p,e,t),!0)}function x(e){b()&&(i.uniform1f(m,y?0:(e-g)/1e3),i.drawArrays(i.TRIANGLE_STRIP,0,4),r.dataset.shaderReady=`true`)}function S(){_||y||!v||document.hidden||(_=requestAnimationFrame(C))}function C(e){_=0,x(e),S()}function w(e){y=e.matches,y&&_&&(cancelAnimationFrame(_),_=0),x(performance.now()),S()}function T(){document.hidden||x(performance.now()),S()}function E(){_&&=(cancelAnimationFrame(_),0),delete r.dataset.shaderReady}let D=new ResizeObserver(()=>x(performance.now()));D.observe(r);let O=new IntersectionObserver(([e])=>{v=e?.isIntersecting??!0,!v&&_&&(cancelAnimationFrame(_),_=0),v&&x(performance.now()),S()});return O.observe(r),h.addEventListener(`change`,w),document.addEventListener(`visibilitychange`,T),r.addEventListener(`webglcontextlost`,E),x(g),S(),()=>{_&&cancelAnimationFrame(_),D.disconnect(),O.disconnect(),h.removeEventListener(`change`,w),document.removeEventListener(`visibilitychange`,T),r.removeEventListener(`webglcontextlost`,E),delete r.dataset.shaderReady,i.deleteBuffer(d),i.deleteProgram(u)}},[]),(0,a.jsxs)(`div`,{"aria-hidden":`true`,className:r(`pointer-events-none overflow-hidden bg-background`,e),children:[(0,a.jsx)(`div`,{className:`dither-surface absolute inset-0 opacity-50`}),(0,a.jsx)(`canvas`,{ref:t,className:`absolute inset-0 size-full opacity-0 data-[shader-ready=true]:opacity-100`})]})}export{l as t};