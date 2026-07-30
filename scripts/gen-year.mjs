import { fontFaceStyle, esc } from "./lib/svg.mjs";

const RAMP = [" ", ":", "+", "#", "@"]; // quiet -> loud

function bucket(count, max) {
  if (count === 0) return 0;
  if (max === 0) return 1;
  const idx = Math.ceil((count / max) * (RAMP.length - 1));
  return Math.min(RAMP.length - 1, Math.max(1, idx));
}

/** days: chronological array of {date, contributionCount}, ~371 entries (GitHub pads to full weeks). */
export function renderYear(days) {
  const max = Math.max(...days.map((d) => d.contributionCount), 1);

  // Lay out GitHub-calendar style: columns = weeks (Sun-Sat), rows = weekday.
  const firstDate = new Date(days[0].date + "T00:00:00Z");
  const firstWeekday = firstDate.getUTCDay(); // 0=Sun
  const weeks = Math.ceil((days.length + firstWeekday) / 7);

  const cell = 12; // px advance per column
  const rowH = 14;
  const width = weeks * cell + 20;
  const height = 7 * rowH + 20;

  let cells = "";
  let dayIdx = 0;
  for (let w = 0; w < weeks; w++) {
    for (let dow = 0; dow < 7; dow++) {
      const slot = w * 7 + dow;
      if (slot < firstWeekday || dayIdx >= days.length) continue;
      const day = days[dayIdx];
      dayIdx += 1;
      const ch = RAMP[bucket(day.contributionCount, max)];
      if (ch === " ") continue;
      const x = 10 + w * cell;
      const y = 12 + dow * rowH;
      const delay = (slot * 0.004).toFixed(3);
      cells += `<text x="${x}" y="${y}" opacity="0">${esc(ch)}<animate attributeName="opacity" from="0" to="1" begin="${delay}s" dur="0.4s" fill="freeze" /></text>\n`;
    }
  }

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
<style>
${fontFaceStyle()}
text { font-family: 'JBM', monospace; font-size: 12px; fill: #39d353; }
@media (prefers-color-scheme: dark) {
  text { fill: #56d364; }
}
</style>
${cells}
</svg>`;
}
