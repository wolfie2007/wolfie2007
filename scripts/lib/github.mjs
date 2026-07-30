const ENDPOINT = "https://api.github.com/graphql";

export async function ghGraphQL(query, variables, token) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GitHub GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

const CONTRIB_QUERY = `
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
    repositories(first: 100, ownerAffiliations: [OWNER], isFork: false, privacy: PUBLIC) {
      nodes {
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node { name color }
          }
        }
      }
    }
  }
}`;

export async function fetchUserData(login, token) {
  const data = await ghGraphQL(CONTRIB_QUERY, { login }, token);
  return data.user;
}

/** Flatten calendar weeks into a single chronological array of {date, count}. */
export function flattenCalendar(calendar) {
  const days = [];
  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      days.push(day);
    }
  }
  return days;
}

/** Current streak (consecutive days up to today/yesterday with contributions)
 *  and longest streak within the last year of data. */
export function computeStreaks(days) {
  let longest = 0;
  let running = 0;
  for (const d of days) {
    if (d.contributionCount > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      current += 1;
    } else {
      // allow today to be zero (day not over yet) without breaking the streak
      if (i === days.length - 1) continue;
      break;
    }
  }

  return { current, longest };
}

/** Aggregate language byte totals across repos, return sorted top N with %. */
export function topLanguages(repos, n = 6) {
  const totals = new Map(); // name -> { size, color }
  for (const repo of repos) {
    for (const edge of repo.languages.edges) {
      const name = edge.node.name;
      const prev = totals.get(name) || { size: 0, color: edge.node.color || "#8b949e" };
      prev.size += edge.size;
      totals.set(name, prev);
    }
  }
  const arr = [...totals.entries()].map(([name, v]) => ({ name, ...v }));
  arr.sort((a, b) => b.size - a.size);
  const top = arr.slice(0, n);
  const total = top.reduce((s, l) => s + l.size, 0) || 1;
  return top.map((l) => ({ ...l, pct: (l.size / total) * 100 }));
}
