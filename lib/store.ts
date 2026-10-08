export type Brief = {
  id: string;
  run: string;          // MORNING | MIDDAY | EVENING | TEST
  createdAt: string;    // ISO
  headline: string;     // one-line summary, shown in history and the text message
  moneyStatus?: string; // e.g. "On track"
  html: string;         // rendered by the cos-brief-design skill
  text: string;         // plain text of the brief, used for search
};

const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const useSupabase = !!(SB_URL && SB_KEY);

export function toText(html: string) {
  return html.replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

// ---- Supabase (PostgREST over fetch; service key stays server-side) ----
async function sb(path: string, init: RequestInit = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init, cache: "no-store",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}
const fromRow = (r: any): Brief => ({
  id: r.id, run: r.run, createdAt: r.created_at, headline: r.headline,
  moneyStatus: r.money_status ?? undefined, html: r.html, text: r.text,
});

// ---- Local development fallback: .data/briefs.json ----
const FILE = ".data/briefs.json";
function loadLocal(): Brief[] {
  const fs = require("fs") as typeof import("fs");
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return []; }
}
function saveLocal(all: Brief[]) {
  const fs = require("fs") as typeof import("fs");
  fs.mkdirSync(".data", { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(all));
}

export async function saveBrief(b: Brief) {
  if (!useSupabase) return saveLocal([b, ...loadLocal()]);
  await sb("cos_briefs", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({
    id: b.id, run: b.run, created_at: b.createdAt, headline: b.headline,
    money_status: b.moneyStatus ?? null, html: b.html, text: b.text }) });
}
export async function getBrief(id: string): Promise<Brief | null> {
  if (!useSupabase) return loadLocal().find(b => b.id === id) ?? null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const rows = await sb(`cos_briefs?id=eq.${id}&limit=1`);
  return rows[0] ? fromRow(rows[0]) : null;
}
export async function allBriefs(n = 60): Promise<Brief[]> {
  if (!useSupabase) return loadLocal().slice(0, n);
  return (await sb(`cos_briefs?select=*&order=created_at.desc&limit=${n}`)).map(fromRow);
}
export async function latestBrief() {
  return (await allBriefs(1))[0] ?? null;
}
// All search words must appear (partial words work). Backed by a trigram index in Postgres.
export async function searchBriefs(q: string, run?: string) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  let rows: Brief[];
  if (useSupabase) {
    const like = terms.map(t => `search_text.ilike.*${t.replace(/[*,()%]/g, "")}*`).join(",");
    const r = run ? `&run=eq.${encodeURIComponent(run)}` : "";
    rows = (await sb(`cos_briefs?select=*&and=(${like})${r}&order=created_at.desc&limit=100`)).map(fromRow);
  } else {
    rows = loadLocal().filter(b => (!run || b.run === run) &&
      terms.every(t => `${b.headline} ${b.text}`.toLowerCase().includes(t)));
  }
  return rows.map(b => {
    const hay = `${b.headline} ${b.text}`;
    const at = terms.length ? Math.max(0, hay.toLowerCase().indexOf(terms[0])) : 0;
    const start = Math.max(0, at - 70);
    return { b, snippet: (start ? "…" : "") + hay.slice(start, start + 200) + "…" };
  });
}
