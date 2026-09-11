import { NextResponse } from "next/server";
import crypto from "crypto";
import { db, ensureSchema } from "../../../../lib/db";
import { checkPaymentStatus } from "../../../../lib/paynow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(req.url);
    const paymentId = Number(searchParams.get("paymentId"));
    if (!Number.isInteger(paymentId) || paymentId < 1) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }

    const pres = await db.execute({
      sql: "SELECT * FROM payments WHERE id = ? LIMIT 1",
      args: [paymentId],
    });
    if (!pres.rows.length) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    const payment = pres.rows[0];

    // Already granted — return the token.
    if (payment.status === "paid" && payment.access_token) {
      return NextResponse.json({
        status: "paid",
        accessToken: payment.access_token,
        lessonId: payment.lesson_id,
      });
    }

    if (!payment.poll_url) {
      return NextResponse.json({ status: payment.status });
    }

    const check = await checkPaymentStatus(payment.poll_url);

    if (check.paid && check.verified) {
      const token = crypto.randomBytes(24).toString("hex");
      await db.execute({
        sql: `UPDATE payments SET status = 'paid', access_token = ?, paid_at = datetime('now') WHERE id = ?`,
        args: [token, paymentId],
      });
      return NextResponse.json({
        status: "paid",
        accessToken: token,
        lessonId: payment.lesson_id,
      });
    }

    // Not paid yet (or not verified) — reflect current status.
    if (check.status && check.status !== payment.status) {
      await db.execute({
        sql: "UPDATE payments SET status = ? WHERE id = ?",
        args: [check.status, paymentId],
      });
    }

    return NextResponse.json({ status: check.status || payment.status });
  } catch (err) {
    console.error("pay status error", err);
    return NextResponse.json({ error: "Status check failed" }, { status: 500 });
  }
}
