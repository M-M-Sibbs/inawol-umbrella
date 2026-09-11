import { createClient } from "@libsql/client";
import { SEED_PROJECTS } from "../lib/content.js";

const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const db = createClient({ url, ...(authToken ? { authToken } : {}) });

async function main() {
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, email TEXT, phone TEXT, company TEXT, industry TEXT,
        team_size TEXT, budget TEXT, pain_points TEXT, desired_solution TEXT,
        score INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT, role TEXT, message TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL, industry TEXT, description TEXT, technologies TEXT,
        problem TEXT, results TEXT, live_url TEXT, case_study_url TEXT, demo_url TEXT,
        media_type TEXT, media_url TEXT, testimonial TEXT, testimonial_author TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL, subject TEXT, level TEXT, description TEXT,
        thumbnail_url TEXT, stream_uid TEXT, preview_seconds INTEGER DEFAULT 0,
        price_usd REAL NOT NULL DEFAULT 0, published INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_id INTEGER NOT NULL, email TEXT NOT NULL, phone TEXT,
        method TEXT, amount REAL, poll_url TEXT, paynow_reference TEXT,
        status TEXT DEFAULT 'created', access_token TEXT,
        created_at TEXT DEFAULT (datetime('now')), paid_at TEXT
      )`,
    ],
    "write"
  );

  const count = await db.execute("SELECT COUNT(*) AS c FROM projects");
  if (Number(count.rows[0].c) === 0) {
    for (const p of SEED_PROJECTS) {
      await db.execute({
        sql: `INSERT INTO projects
          (title, industry, description, technologies, problem, results,
           live_url, case_study_url, demo_url, media_type, media_url,
           testimonial, testimonial_author)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.title, p.industry, p.description, p.technologies, p.problem, p.results,
          p.live_url, p.case_study_url, p.demo_url, p.media_type, p.media_url,
          p.testimonial, p.testimonial_author,
        ],
      });
    }
    console.log(`Seeded ${SEED_PROJECTS.length} projects.`);
  } else {
    console.log("Projects already exist, skipping seed.");
  }
  console.log("Database ready ✓");
}

main().catch((e) => { console.error(e); process.exit(1); });
