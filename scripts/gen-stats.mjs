import { fontFaceStyle, esc } from "./lib/svg.mjs";

export function renderStats(total, activeDays, bestWeek, weeklyTotals) {
  const width = 620;
  const height = 140;
  const totalStr = total.toLocaleString("en-US");

  // Generate path points for the sparkline
  const maxW = weeklyTotals.length - 1;
  const graphH = 40;
  const graphBaseY = 135;
  const points = weeklyTotals.map((val, i) => {
    const x = (i / maxW) * width;
    const y = graphBaseY - (val / bestWeek) * graphH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylineStr = points.join(" ");
  // Close the polygon for the fill
  const polygonStr = `0,${height} ${polylineStr} ${width},${height}`;

  // Delay for animations
  const lastX = width;
  const lastY = graphBaseY - (weeklyTotals[weeklyTotals.length - 1] / bestWeek) * graphH;

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
<style>
${fontFaceStyle()}
text { font-family: 'JBM', monospace; }
.num { font-size: 40px; font-weight: bold; fill: #1f2328; }
.sub { font-size: 13px; fill: #656d76; }
.stat-num { font-size: 18px; font-weight: bold; fill: #1f2328; text-anchor: end; }
.stat-lbl { font-size: 11px; fill: #656d76; text-anchor: end; }
.cursor { fill: #3fb950; }
.line { fill: none; stroke: #1f2328; stroke-width: 1.5; }
.fill { fill: #f6f8fa; }
.dot { fill: #1f2328; }
@media (prefers-color-scheme: dark) {
  .num { fill: #e6edf3; }
  .stat-num { fill: #e6edf3; }
  .sub { fill: #8b949e; }
  .stat-lbl { fill: #8b949e; }
  .line { stroke: #c9d1d9; }
  .fill { fill: #21262d; }
  .dot { fill: #c9d1d9; }
}
</style>
<text x="0" y="46" class="num">${esc(totalStr)}</text>
<text x="2" y="70" class="sub">contributions in the last year</text>

<text x="${width - 4}" y="20" class="stat-num">${activeDays}</text>
<text x="${width - 4}" y="36" class="stat-lbl">active days</text>
<text x="${width - 4}" y="60" class="stat-num">${bestWeek}</text>
<text x="${width - 4}" y="76" class="stat-lbl">best week</text>

<clipPath id="reveal">
  <rect x="0" y="80" width="0" height="60">
    <animate attributeName="width" from="0" to="${width}" dur="1s" fill="freeze" />
  </rect>
</clipPath>

<g clip-path="url(#reveal)">
  <polygon points="${polygonStr}" class="fill" />
  <polyline points="${polylineStr}" class="line" />
</g>
<circle cx="${lastX}" cy="${lastY}" r="2.5" class="dot">
  <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.99;1" dur="1s" fill="freeze" />
</circle>
</svg>`;
}
