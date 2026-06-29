import crypto from "crypto";
import { cookies } from "next/headers";
import { db, ensureSchema } from "./db";

// === Configuration ===
// The admin path is configurable so it can be moved off any guessable URL.
// Default is "/dashboard" but you can rotate it via env without touching code.
export const ADMIN_PATH = process.env.ADMIN_PATH || "/dashboard";

export const SESSION_COOKIE = "umb_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

// === Password verification (constant-time, scrypt-based) ===
// ADMIN_PASSWORD_HASH is a single base64 string with no special characters
// (dotenv treats `$` as variable expansion, so we deliberately avoid it).
// Internal layout, base64-decoded: [1 byte version=1][16 bytes salt][32 bytes key]
// Generate one with: `npm run admin:hash -- 'your-strong-password'`
export function verifyPassword(plain) {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored) return false;
  try {
    const buf = Buffer.from(stored, "base64");
    if (buf.length !== 1 + 16 + 32 || buf[0] !== 1) return false;
    const salt = buf.subarray(1, 17);
    const expected = buf.subarray(17);
    const actual = crypto.scryptSync(plain, salt, expected.length, { N: 16384, r: 8, p: 1 });
    return expected.length === actual.length &&
      crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function hashPassword(plain) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(plain, salt, 32, { N: 16384, r: 8, p: 1 });
  const buf = Buffer.concat([Buffer.from([1]), salt, key]);
  return buf.toString("base64");
}

// === Sessions (stored in DB so logout is real) ===
async function ensureSessionTable() {
  await db.execute(`CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS login_attempts (
    ip TEXT PRIMARY KEY,
    attempts INTEGER DEFAULT 0,
    blocked_until INTEGER DEFAULT 0
  )`);
}

export async function createSession() {
  await ensureSchema();
  await ensureSessionTable();
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  await db.execute({
    sql: "INSERT INTO sessions (token, expires_at) VALUES (?, ?)",
    args: [token, expires],
  });
  return { token, maxAge: SESSION_TTL_SECONDS };
}

export async function destroySession(token) {
  if (!token) return;
  try {
    await ensureSessionTable();
    await db.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [token] });
  } catch {}
}

export async function isAuthenticated() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await ensureSessionTable();
    const res = await db.execute({
      sql: "SELECT expires_at FROM sessions WHERE token = ? LIMIT 1",
      args: [token],
    });
    if (!res.rows.length) return false;
    const exp = Number(res.rows[0].expires_at);
    if (Date.now() / 1000 > exp) {
      // expired — clean up
      await db.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [token] });
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// === Rate limiting (per-IP, persistent) ===
const MAX_ATTEMPTS = 5;
const BLOCK_SECONDS = 15 * 60; // 15 minutes after exceeding attempts

export async function checkRateLimit(ip) {
  await ensureSessionTable();
  const now = Math.floor(Date.now() / 1000);
  const res = await db.execute({
    sql: "SELECT attempts, blocked_until FROM login_attempts WHERE ip = ?",
    args: [ip],
  });
  if (!res.rows.length) return { allowed: true, remaining: MAX_ATTEMPTS };
  const row = res.rows[0];
  const blockedUntil = Number(row.blocked_until || 0);
  if (blockedUntil > now) {
    return { allowed: false, retryAfter: blockedUntil - now };
  }
  const attempts = Number(row.attempts || 0);
  if (attempts >= MAX_ATTEMPTS) {
    // Reset window if block already expired
    await db.execute({
      sql: "UPDATE login_attempts SET attempts = 0, blocked_until = 0 WHERE ip = ?",
      args: [ip],
    });
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }
  return { allowed: true, remaining: MAX_ATTEMPTS - attempts };
}

export async function recordFailedAttempt(ip) {
  await ensureSessionTable();
  const now = Math.floor(Date.now() / 1000);
  const res = await db.execute({
    sql: "SELECT attempts FROM login_attempts WHERE ip = ?",
    args: [ip],
  });
  const current = res.rows.length ? Number(res.rows[0].attempts) : 0;
  const next = current + 1;
  const blockedUntil = next >= MAX_ATTEMPTS ? now + BLOCK_SECONDS : 0;

  if (res.rows.length) {
    await db.execute({
      sql: "UPDATE login_attempts SET attempts = ?, blocked_until = ? WHERE ip = ?",
      args: [next, blockedUntil, ip],
    });
  } else {
    await db.execute({
      sql: "INSERT INTO login_attempts (ip, attempts, blocked_until) VALUES (?, ?, ?)",
      args: [ip, next, blockedUntil],
    });
  }
}

export async function clearAttempts(ip) {
  try {
    await ensureSessionTable();
    await db.execute({ sql: "DELETE FROM login_attempts WHERE ip = ?", args: [ip] });
  } catch {}
}

export function getClientIp(req) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
