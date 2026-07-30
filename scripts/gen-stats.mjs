import { fontFaceStyle, esc } from "./lib/svg.mjs";

export function renderStats(total) {
  const width = 340;
  const height = 100;
  const totalStr = total.toLocaleString("en-US");

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
<style>
${fontFaceStyle()}
text { font-family: 'JBM', monospace; }
.num { font-size: 40px; font-weight: bold; fill: #1f2328; }
.sub { font-size: 13px; fill: #656d76; }
.cursor { fill: #3fb950; }
@media (prefers-color-scheme: dark) {
  .num { fill: #e6edf3; }
  .sub { fill: #8b949e; }
}
</style>
<text x="0" y="46" class="num">${esc(totalStr)}<tspan class="cursor">_<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1s" repeatCount="indefinite" /></tspan></text>
<text x="2" y="70" class="sub">contributions in the last year</text>
</svg>`;
}
