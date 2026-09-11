import { NextResponse } from "next/server";
import { db, ensureSchema } from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";

export const runtime = "nodejs";

// Public: list published lessons (without the stream UID — that's protected).
export async function GET() {
  try {
    await ensureSchema();
    const res = await db.execute(
      `SELECT id, title, subject, level, description, thumbnail_url,
              preview_seconds, price_usd, created_at
       FROM lessons WHERE published = 1 ORDER BY created_at DESC`
    );
    return NextResponse.json({ lessons: res.rows });
  } catch (err) {
    console.error("lessons GET error", err);
    return NextResponse.json({ error: "Failed to load lessons" }, { status: 500 });
  }
}

// Admin: create a lesson.
export async function POST(req) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureSchema();
    const b = await req.json();
    if (!b.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const price = Number(b.price_usd);
    const res = await db.execute({
      sql: `INSERT INTO lessons
        (title, subject, level, description, thumbnail_url, stream_uid,
         preview_seconds, price_usd, published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        b.title.trim().slice(0, 200),
        b.subject || null,
        b.level || null,
        b.description || null,
        b.thumbnail_url || null,
        b.stream_uid || null,
        Number.isFinite(Number(b.preview_seconds)) ? Number(b.preview_seconds) : 0,
        Number.isFinite(price) ? price : 0,
        b.published === false ? 0 : 1,
      ],
    });
    return NextResponse.json({ id: Number(res.lastInsertRowid) });
  } catch (err) {
    console.error("lessons POST error", err);
    return NextResponse.json({ error: "Failed to save lesson" }, { status: 500 });
  }
}
