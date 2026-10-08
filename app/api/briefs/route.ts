import { NextRequest, NextResponse } from "next/server";
import { safeEqual } from "@/lib/auth";
import { saveBrief, toText, type Brief } from "@/lib/store";

// Called by the COS agent after the brief is rendered.
// Authorization: Bearer $INGEST_SECRET   Body: { run, headline, moneyStatus?, html }
export async function POST(req: NextRequest) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  const secret = process.env.INGEST_SECRET || "";
  if (!secret || !safeEqual(token, secret)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.html || !body?.run || !body?.headline) {
    return NextResponse.json({ error: "run, headline and html are required" }, { status: 400 });
  }
  if (String(body.html).length > 900_000) return NextResponse.json({ error: "too large" }, { status: 413 });

  const brief: Brief = {
    id: crypto.randomUUID(),
    run: String(body.run).toUpperCase().slice(0, 20),
    createdAt: new Date().toISOString(),
    headline: String(body.headline).slice(0, 300),
    moneyStatus: body.moneyStatus ? String(body.moneyStatus).slice(0, 40) : undefined,
    html: String(body.html),
    text: toText(String(body.html)),
  };
  await saveBrief(brief);
  const origin = new URL(req.url).origin;
  return NextResponse.json({ id: brief.id, url: `${origin}/b/${brief.id}`, latestUrl: `${origin}/` });
}

// Browsers visit with GET; this endpoint only accepts POST from the COS agent.
export async function GET() {
  return NextResponse.json({ error: "POST only. Briefs are viewed at /" }, { status: 405, headers: { Allow: "POST" } });
}
