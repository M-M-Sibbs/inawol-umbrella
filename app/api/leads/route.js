import { NextResponse } from "next/server";
import { db, ensureSchema } from "../../../lib/db";
import { isAuthenticated } from "../../../lib/auth";

export const runtime = "nodejs";

// Protected — captured leads are sensitive PII.
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureSchema();
    const res = await db.execute(
      "SELECT * FROM leads ORDER BY created_at DESC LIMIT 500"
    );
    return NextResponse.json({ leads: res.rows });
  } catch (err) {
    console.error("leads error", err);
    return NextResponse.json({ error: "Failed to load leads" }, { status: 500 });
  }
}
