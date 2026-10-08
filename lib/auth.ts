// Signed-cookie auth. Uses Web Crypto so it runs in middleware (edge) and node.
const enc = new TextEncoder();
export const COOKIE = "cos_session";
const MAX_AGE = 60 * 60 * 24 * 30;

async function sign(msg: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(process.env.SESSION_SECRET || ""),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
export async function makeToken() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return `${exp}.${await sign(String(exp))}`;
}
export async function verifyToken(t?: string) {
  if (!t || !process.env.SESSION_SECRET) return false;
  const [exp, sig] = t.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await sign(exp));
}
export const cookieMaxAge = MAX_AGE;
