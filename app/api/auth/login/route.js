import { NextResponse } from "next/server";
import {
  verifyPassword,
  createSession,
  checkRateLimit,
  recordFailedAttempt,
  clearAttempts,
  getClientIp,
  SESSION_COOKIE,
} from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(req) {
  const ip = getClientIp(req);

  // Server-side guard: refuse to authenticate if no password has been set.
  if (!process.env.ADMIN_PASSWORD_HASH) {
    return NextResponse.json(
      { error: "Admin not configured. Run `npm run admin:hash -- 'your-password'` and add the hash to .env." },
      { status: 503 }
    );
  }

  // Rate limit BEFORE doing any work that could be timed.
  const rl = await checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfter / 60)} minute(s).` },
      { status: 429 }
    );
  }

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const password = typeof body.password === "string" ? body.password : "";

  // Always do the password check (timing-safe) so we don't leak the existence
  // of a configured account vs. wrong password.
  const ok = verifyPassword(password);

  if (!ok) {
    await recordFailedAttempt(ip);
    // Small artificial delay to slow brute force.
    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  await clearAttempts(ip);
  const { token, maxAge } = await createSession();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}
