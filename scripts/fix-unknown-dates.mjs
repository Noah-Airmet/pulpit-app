import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

/**
 * Fixes UNKNOWN-DATE in ingest markdown:
 * 1) (conference, session) -> date from cleaned corpus (exact match).
 * 2) If missing: Thursday/Friday sessions use dates derived from the earliest
 *    Saturday session date for that conference in the cleaned corpus (the cleaned
 *    set labels only weekend sessions; unknown files use Thu/Fri welfare/aux labels).
 * 3) session: null -> heuristics for statistical report, solemn assembly, welfare dept.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const GOOD_DIR = path.join(ROOT, "ingest/Cleaned up files (codex)");
const BAD_DIR = path.join(ROOT, "ingest/Unknown date (needs fix)");

function pairKey(conference, session) {
  return `${conference}\0${session}`;
}

function addDays(isoDate, deltaDays) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

function slugFromUrl(u) {
  if (u == null || typeof u !== "string") return "";
  const noQuery = u.split("?")[0];
  const parts = noQuery.split("/").filter(Boolean);
  return (parts[parts.length - 1] || "").toLowerCase();
}

function resolveNullSessionDate(data, satDateStr) {
  if (satDateStr == null) return null;
  const title = String(data.source_title ?? "").toLowerCase();
  const slug = slugFromUrl(data.source_url);
  if (title.includes("statistical") || slug.includes("statistical-report")) {
    return addDays(satDateStr, -1);
  }
  if (title.includes("solemn assembly") || slug.includes("solemn-assembly")) {
    return satDateStr;
  }
  if (title.includes("welfare") && title.includes("department")) {
    return addDays(satDateStr, -2);
  }
  return null;
}

async function buildMaps() {
  const names = await fs.readdir(GOOD_DIR);
  const direct = new Map();
  const satByConference = new Map();

  for (const name of names) {
    if (!name.endsWith(".md")) continue;
    const content = await fs.readFile(path.join(GOOD_DIR, name), "utf8");
    const { data } = matter(content);
    const conference = data.conference;
    const session = data.session;
    const date = data.date;
    if (conference != null && session != null && date != null) {
      const k = pairKey(conference, session);
      if (!direct.has(k)) direct.set(k, String(date));
    }
    if (
      conference != null &&
      session != null &&
      date != null &&
      (session === "Saturday Morning Session" ||
        session === "Saturday Afternoon Session")
    ) {
      const d = String(date);
      const prev = satByConference.get(conference);
      if (prev == null || d < prev) satByConference.set(conference, d);
    }
  }

  return { direct, satByConference };
}

function resolveDate(data, direct, satByConference) {
  const conference = data.conference;
  if (conference == null || conference === "") return null;

  const sat = satByConference.get(conference);
  if (sat == null) return null;

  const session = data.session;
  if (session != null && session !== "") {
    const k = pairKey(conference, session);
    if (direct.has(k)) return direct.get(k);
    const s = String(session);
    if (s.includes("Thursday")) return addDays(sat, -2);
    if (s.includes("Friday")) return addDays(sat, -1);
    return null;
  }

  return resolveNullSessionDate(data, sat);
}

async function main() {
  const { direct, satByConference } = await buildMaps();
  const badNames = (await fs.readdir(BAD_DIR)).filter((n) => n.endsWith(".md"));

  let fixed = 0;
  let unresolvable = 0;
  const unresolvableList = [];

  for (const name of badNames) {
    const filePath = path.join(BAD_DIR, name);
    const raw = await fs.readFile(filePath, "utf8");
    const { data } = matter(raw);

    if (!raw.includes("UNKNOWN-DATE")) {
      unresolvable++;
      unresolvableList.push({
        file: name,
        reason: "no UNKNOWN-DATE substring in file (skipped)",
      });
      continue;
    }

    const resolved = resolveDate(data, direct, satByConference);
    if (resolved == null) {
      unresolvable++;
      unresolvableList.push({
        file: name,
        conference: data.conference ?? null,
        session: data.session ?? null,
        reason: "could not resolve date (no direct match, not Thu/Fri session, null-session heuristics did not apply)",
      });
      continue;
    }

    const newContent = raw.split("UNKNOWN-DATE").join(resolved);
    const newName = name.split("UNKNOWN-DATE").join(resolved);
    const newPath = path.join(BAD_DIR, newName);

    if (newPath !== filePath) {
      try {
        await fs.access(newPath);
        unresolvable++;
        unresolvableList.push({
          file: name,
          reason: `target already exists: ${newName}`,
        });
        continue;
      } catch {
        // target does not exist
      }
    }

    if (newPath === filePath) {
      await fs.writeFile(filePath, newContent, "utf8");
    } else {
      await fs.writeFile(newPath, newContent, "utf8");
      await fs.unlink(filePath);
    }
    fixed++;
  }

  for (const item of unresolvableList) {
    console.error("UNRESOLVABLE:", JSON.stringify(item));
  }

  console.log("\nSummary:");
  console.log(`  fixed:         ${fixed}`);
  console.log(`  unresolvable:  ${unresolvable}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
