import type { Brief } from "@/lib/store";

export function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Chicago", weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}
export function BriefView({ b }: { b: Brief }) {
  return (
    <div className="viewer">
      <div className="meta">
        <span><span className="badge">{b.run}</span>{fmt(b.createdAt)} CT</span>
        <a href="/search">History</a>
      </div>
      {/* Brief HTML is built from email content: sandbox it (no scripts, no same-origin). */}
      <iframe title="Brief" srcDoc={b.html} sandbox="" />
    </div>
  );
}
