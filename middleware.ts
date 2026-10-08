import { NextRequest, NextResponse } from "next/server";
import { COOKIE, verifyToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Login page/API and the agent ingest endpoint (bearer-token protected) are public.
  if (pathname.startsWith("/login") || pathname.startsWith("/api/login") || pathname.startsWith("/api/briefs")) {
    return NextResponse.next();
  }
  if (await verifyToken(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}
export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
