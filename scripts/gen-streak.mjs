import { fontFaceStyle, esc } from "./lib/svg.mjs";

export function renderStreak({ current, longest, total }) {
  const cols = [
    { label: "current streak", value: `${current}d` },
    { label: "longest streak", value: `${longest}d` },
    { label: "contributions", value: `${total}` },
  ];

  const width = 720;
  const height = 130;
  const colW = width / cols.length;

  const blocks = cols
    .map((c, i) => {
      const cx = colW * i + colW / 2;
      return `
  <g transform="translate(${cx},0)" opacity="0">
    <animate attributeName="opacity" from="0" to="1" begin="${(i * 0.15).toFixed(2)}s" dur="0.6s" fill="freeze" />
    <text x="0" y="58" text-anchor="middle" class="value">${esc(c.value)}</text>
    <text x="0" y="86" text-anchor="middle" class="label">${esc(c.label)}</text>
  </g>`;
    })
    .join("\n");

  const dividers = cols
    .slice(1)
    .map((_, i) => {
      const x = colW * (i + 1);
      return `<line x1="${x}" y1="20" x2="${x}" y2="${height - 20}" class="div" />`;
    })
    .join("\n");

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
<style>
${fontFaceStyle()}
text { font-family: 'JBM', monospace; }
.value { font-size: 30px; font-weight: bold; fill: #1f2328; }
.label { font-size: 12px; fill: #656d76; letter-spacing: 1px; }
.div { stroke: #d0d7de; stroke-width: 1; }
.flame { fill: #ff8a3d; }
@media (prefers-color-scheme: dark) {
  .value { fill: #e6edf3; }
  .label { fill: #8b949e; }
  .div { stroke: #30363d; }
}
</style>
${dividers}
${blocks}
<g transform="translate(${colW / 2 - 2}, 14)">
  <path class="flame" d="M6 0c1.2 2 3 3.2 3 5.6a3 3 0 1 1-6 0C3 3.4 4.6 2 6 0z">
    <animateTransform attributeName="transform" type="scale" values="1;1.12;1" dur="1.6s" repeatCount="indefinite" additive="sum" />
  </path>
</g>
</svg>`;
}
