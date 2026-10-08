import { allBriefs, searchBriefs } from "@/lib/store";
import { fmt } from "../components";
export const dynamic = "force-dynamic";
const RUNS = ["MORNING", "MIDDAY", "EVENING", "TEST"];

function esc(s: string) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!)); }
function hl(s: string, q: string) {
  let out = esc(s);
  for (const t of q.split(/\s+/).filter(Boolean)) {
    out = out.replace(new RegExp(`(${esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark>$1</mark>");
  }
  return out;
}

export default async function History({ searchParams }: { searchParams: Promise<{ q?: string; run?: string }> }) {
  const { q = "", run = "" } = await searchParams;
  const rows = q.trim()
    ? await searchBriefs(q, run || undefined)
    : (await allBriefs(60)).filter(b => !run || b.run === run).map(b => ({ b, snippet: b.headline }));
  const chip = (r: string, label: string) => (
    <a key={label} className={`chip${run === r ? " on" : ""}`} href={`/search?${new URLSearchParams({ ...(q && { q }), ...(r && { run: r }) })}`}>{label}</a>
  );
  return (
    <main className="wrap">
      <div className="eyebrow">Agent history</div>
      <h1>Search past briefs</h1>
      <form className="row" action="/search">
        {run && <input type="hidden" name="run" value={run} />}
        <input className="input" name="q" defaultValue={q} placeholder="Customer, order, vendor, bill…" />
        <button className="btn">Search</button>
      </form>
      <div className="chips">{chip("", "All")}{RUNS.map(r => chip(r, r))}</div>
      {rows.length === 0 && <p className="muted">{q ? "Nothing matched. Try fewer words." : "No briefs have been published yet."}</p>}
      {rows.map(({ b, snippet }) => (
        <a key={b.id} className="card" href={`/b/${b.id}`}>
          <span className="badge">{b.run}</span><span className="muted">{fmt(b.createdAt)}</span>
          <div style={{ marginTop: 8 }}><b dangerouslySetInnerHTML={{ __html: hl(b.headline, q) }} /></div>
          {q && <div className="muted" dangerouslySetInnerHTML={{ __html: hl(snippet, q) }} />}
        </a>
      ))}
    </main>
  );
}
