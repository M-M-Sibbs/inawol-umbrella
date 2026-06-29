import { createClient } from "@libsql/client";

// Turso (libSQL) client.
// Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your environment / Vercel project.
// For local dev without Turso, falls back to a local file DB.
const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  ...(authToken ? { authToken } : {}),
});

// Ensures tables exist. Safe to call repeatedly.
let initialized = false;
export async function ensureSchema() {
  if (initialized) return;
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        company TEXT,
        industry TEXT,
        team_size TEXT,
        budget TEXT,
        pain_points TEXT,
        desired_solution TEXT,
        score INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        role TEXT,
        message TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        industry TEXT,
        description TEXT,
        technologies TEXT,
        problem TEXT,
        results TEXT,
        live_url TEXT,
        case_study_url TEXT,
        demo_url TEXT,
        media_type TEXT,        -- 'image' | 'video'
        media_url TEXT,
        testimonial TEXT,
        testimonial_author TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
    ],
    "write"
  );
  initialized = true;
}
