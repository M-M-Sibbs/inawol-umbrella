import { NextResponse } from "next/server";
import crypto from "crypto";
import { db, ensureSchema } from "../../../../lib/db";
import { validateCallback } from "../../../../lib/paynow";

export const runtime = "nodejs";

// Paynow POSTs here (form-encoded) when a transaction's status changes.
// This is the authoritative confirmation — independent of the user's browser.
export async function POST(req) {
  try {
    await ensureSchema();
    const form = await req.formData();
    const values = {};
    for (const [k, v] of form.entries()) values[k.toLowerCase()] = String(v);

    const result = validateCallback(values);
    if (!result.valid) {
      // Hash mismatch — ignore (possible tampering).
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const reference = result.reference;
    if (!reference) return NextResponse.json({ ok: true });

    const pres = await db.execute({
      sql: "SELECT * FROM payments WHERE paynow_reference = ? LIMIT 1",
      args: [reference],
    });
    if (!pres.rows.length) return NextResponse.json({ ok: true });
    const payment = pres.rows[0];

    if (result.paid && payment.status !== "paid") {
      const token = payment.access_token || crypto.randomBytes(24).toString("hex");
      await db.execute({
        sql: `UPDATE payments SET status = 'paid', access_token = ?, paid_at = datetime('now') WHERE id = ?`,
        args: [token, payment.id],
      });
    } else if (!result.paid && result.status !== payment.status) {
      await db.execute({
        sql: "UPDATE payments SET status = ? WHERE id = ?",
        args: [result.status, payment.id],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("paynow callback error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
