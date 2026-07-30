import { fontFaceStyle, esc } from "./lib/svg.mjs";

export function renderLangs(languages) {
  const width = 720;
  const rowH = 34;
  const barX = 150;
  const barMaxW = width - barX - 60;
  const height = languages.length * rowH + 20;

  const rows = languages
    .map((lang, i) => {
      const y = 20 + i * rowH;
      const barW = Math.max(4, (lang.pct / 100) * barMaxW);
      const delay = (i * 0.12).toFixed(2);
      return `
  <text x="0" y="${y + 15}" class="name">${esc(lang.name)}</text>
  <rect x="${barX}" y="${y + 4}" width="0" height="10" rx="5" fill="${lang.color}">
    <animate attributeName="width" from="0" to="${barW.toFixed(1)}" begin="${delay}s" dur="0.8s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" />
  </rect>
  <text x="${barX + barMaxW + 12}" y="${y + 15}" class="pct" opacity="0">${lang.pct.toFixed(1)}%
    <animate attributeName="opacity" from="0" to="1" begin="${(Number(delay) + 0.5).toFixed(2)}s" dur="0.3s" fill="freeze" />
  </text>`;
    })
    .join("\n");

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
<style>
${fontFaceStyle()}
text { font-family: 'JBM', monospace; font-size: 13px; fill: #1f2328; }
.name { fill: #1f2328; }
.pct { text-anchor: end; fill: #656d76; font-size: 12px; }
@media (prefers-color-scheme: dark) {
  .name { fill: #e6edf3; }
  .pct { fill: #8b949e; }
}
</style>
${rows}
</svg>`;
}
