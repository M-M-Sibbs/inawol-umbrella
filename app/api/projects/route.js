import { NextResponse } from "next/server";
import { db, ensureSchema } from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";

export const runtime = "nodejs";

// Public — used by homepage and /projects to display the portfolio.
export async function GET() {
  try {
    await ensureSchema();
    const res = await db.execute(
      "SELECT * FROM projects ORDER BY created_at DESC"
    );
    return NextResponse.json({ projects: res.rows });
  } catch (err) {
    console.error("projects GET error", err);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

// Protected — only authenticated admin can create.
export async function POST(req) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureSchema();
    const b = await req.json();
    if (!b.title || typeof b.title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const res = await db.execute({
      sql: `INSERT INTO projects
        (title, industry, description, technologies, problem, results,
         live_url, case_study_url, demo_url, media_type, media_url,
         testimonial, testimonial_author)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        b.title.trim().slice(0, 200),
        b.industry || null,
        b.description || null,
        b.technologies || null,
        b.problem || null,
        b.results || null,
        b.live_url || null,
        b.case_study_url || null,
        b.demo_url || null,
        b.media_type || "image",
        b.media_url || null,
        b.testimonial || null,
        b.testimonial_author || null,
      ],
    });
    return NextResponse.json({ id: Number(res.lastInsertRowid) });
  } catch (err) {
    console.error("projects POST error", err);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}
