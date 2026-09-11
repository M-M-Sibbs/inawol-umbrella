import { NextResponse } from "next/server";
import { db, ensureSchema } from "../../../../lib/db";
import { isAuthenticated } from "../../../../lib/auth";

export const runtime = "nodejs";

function badId() {
  return NextResponse.json({ error: "Invalid id" }, { status: 400 });
}

export async function PATCH(req, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return badId();

  let b;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const FIELDS = [
    "title", "subject", "level", "description", "thumbnail_url",
    "stream_uid", "preview_seconds", "price_usd", "published",
  ];
  const sets = [];
  const args = [];
  for (const f of FIELDS) {
    if (Object.prototype.hasOwnProperty.call(b, f)) {
      sets.push(`${f} = ?`);
      let v = b[f];
      if (f === "published") v = v ? 1 : 0;
      if (f === "price_usd" || f === "preview_seconds") v = Number(v) || 0;
      if (v === "") v = null;
      args.push(v);
    }
  }
  if (!sets.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  args.push(id);

  try {
    await ensureSchema();
    await db.execute({ sql: `UPDATE lessons SET ${sets.join(", ")} WHERE id = ?`, args });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("lesson PATCH error", err);
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
    await db.execute({ sql: "DELETE FROM lessons WHERE id = ?", args: [id] });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("lesson DELETE error", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
