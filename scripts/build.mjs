import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  fetchUserData,
  flattenCalendar,
  computeStreaks,
  topLanguages,
} from "./lib/github.mjs";
import { renderStreak } from "./gen-streak.mjs";
import { renderLangs } from "./gen-langs.mjs";
import { renderYear } from "./gen-year.mjs";
import { renderStats } from "./gen-stats.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const LOGIN = process.env.PROFILE_LOGIN || "wolfie2007";
const TOKEN = process.env.GH_PAT || process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("Missing GH_PAT (or GITHUB_TOKEN) env var.");
  process.exit(1);
}

async function main() {
  const user = await fetchUserData(LOGIN, TOKEN);
  const calendar = user.contributionsCollection.contributionCalendar;
  const days = flattenCalendar(calendar);
  const streaks = computeStreaks(days);
  const langs = topLanguages(user.repositories.nodes, 6);

  const files = {
    "streak.svg": renderStreak({
      current: streaks.current,
      longest: streaks.longest,
      total: calendar.totalContributions,
    }),
    "langs.svg": renderLangs(langs),
    "year.svg": renderYear(days),
    "stats.svg": renderStats(calendar.totalContributions),
  };

  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(ROOT, name), content);
    console.log(`wrote ${name}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
