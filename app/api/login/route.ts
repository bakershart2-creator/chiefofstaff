import { NextRequest, NextResponse } from "next/server";
import { COOKIE, cookieMaxAge, makeToken, safeEqual } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const pw = String(form.get("password") || "");
  let next = String(form.get("next") || "/");
  if (!next.startsWith("/") || next.startsWith("//")) next = "/"; // no open redirects
  const expected = process.env.SITE_PASSWORD || "";
  if (!expected || !safeEqual(pw, expected)) {
    return NextResponse.redirect(new URL(`/login?error=1&next=${encodeURIComponent(next)}`, req.url), 303);
  }
  const res = NextResponse.redirect(new URL(next, req.url), 303);
  res.cookies.set(COOKIE, await makeToken(), { httpOnly: true, secure: true, sameSite: "lax", maxAge: cookieMaxAge, path: "/" });
  return res;
}
