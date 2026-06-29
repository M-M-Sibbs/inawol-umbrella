import { NextResponse } from "next/server";
import { db, ensureSchema } from "../../../../lib/db";
import { isAuthenticated } from "../../../../lib/auth";

export const runtime = "nodejs";

function badId() {
  return NextResponse.json({ error: "Invalid id" }, { status: 400 });
}

export async function GET(_req, { params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return badId();
  try {
    await ensureSchema();
    const res = await db.execute({
      sql: "SELECT * FROM projects WHERE id = ? LIMIT 1",
      args: [id],
    });
    if (!res.rows.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ project: res.rows[0] });
  } catch (err) {
    console.error("project GET error", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return badId();

  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Whitelist editable fields only.
  const FIELDS = [
    "title", "industry", "description", "technologies", "problem", "results",
    "live_url", "case_study_url", "demo_url", "media_type", "media_url",
    "testimonial", "testimonial_author",
  ];
  const sets = [];
  const args = [];
  for (const f of FIELDS) {
    if (Object.prototype.hasOwnProperty.call(b, f)) {
      sets.push(`${f} = ?`);
      args.push(b[f] === "" ? null : b[f]);
    }
  }
  if (!sets.length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  args.push(id);

  try {
    await ensureSchema();
    await db.execute({
      sql: `UPDATE projects SET ${sets.join(", ")} WHERE id = ?`,
      args,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("project PATCH error", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return badId();
  try {
    await ensureSchema();
    await db.execute({ sql: "DELETE FROM projects WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("project DELETE error", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
