#!/usr/bin/env node
// Posts a rendered brief to the COS site and prints the link and the exact text to send.
// Usage: node scripts/publish-brief.mjs --run MORNING|MIDDAY|EVENING|TEST --headline "..." --html brief.html
// Env:   SITE_URL (e.g. https://chiefofstaff-bay.vercel.app), INGEST_SECRET (never printed)
import { readFileSync } from "node:fs";

const arg = n => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : undefined; };
const run = (arg("run") || "").toUpperCase();
const headline = arg("headline");
const file = arg("html");
const site = (process.env.SITE_URL || "").replace(/\/$/, "");
const secret = process.env.INGEST_SECRET || "";
const SESSION = { MORNING: "AM", MIDDAY: "Midday", EVENING: "End of Day", TEST: null };

if (!(run in SESSION) || !headline || !file || !site || !secret) {
  console.error("Need --run (MORNING|MIDDAY|EVENING|TEST), --headline, --html <file>, and env SITE_URL + INGEST_SECRET.");
  process.exit(2);
}
// TEST runs are labeled by time of day so the text still reads AM / Midday / End of Day.
const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", hour12: false }).format(new Date())) % 24;
const session = SESSION[run] ?? (hour < 10 ? "AM" : hour < 15 ? "Midday" : "End of Day");
const when = new Date().toLocaleString("en-US", { timeZone: "America/Chicago", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).replace(",", "") + " CT";

let res, body;
for (let attempt = 1; attempt <= 2; attempt++) { // retry once, per the agent prompt
  try {
    res = await fetch(`${site}/api/briefs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ run, headline, html: readFileSync(file, "utf8") }),
    });
    body = await res.json().catch(() => ({}));
    if (res.ok) break;
  } catch (e) { body = { error: String(e.message || e) }; }
}
if (!res?.ok) {
  console.error(JSON.stringify({ ok: false, status: res?.status ?? 0, error: body?.error ?? "request failed" }));
  process.exit(1);
}
const sms = `COS Update · ${session} · ${when}\n${run === "TEST" ? "TEST: " : ""}${headline}\n${body.url}`;
console.log(JSON.stringify({ ok: true, url: body.url, session, sms }, null, 2));
