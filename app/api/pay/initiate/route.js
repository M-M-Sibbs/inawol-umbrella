import { NextResponse } from "next/server";
import crypto from "crypto";
import { db, ensureSchema } from "../../../../lib/db";
import {
  paynowConfigured,
  createWebPayment,
  createMobilePayment,
} from "../../../../lib/paynow";

export const runtime = "nodejs";

const MOBILE_METHODS = ["ecocash", "innbucks", "omari"];

export async function POST(req) {
  try {
    await ensureSchema();
    const b = await req.json();
    const lessonId = Number(b.lessonId);
    const email = (b.email || "").trim();
    const phone = (b.phone || "").trim();
    const method = (b.method || "web").toLowerCase();

    if (!Number.isInteger(lessonId) || lessonId < 1) {
      return NextResponse.json({ error: "Invalid lesson" }, { status: 400 });
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (MOBILE_METHODS.includes(method) && !phone) {
      return NextResponse.json({ error: "Phone number is required for mobile money" }, { status: 400 });
    }

    // Fetch the lesson & price from the DB (never trust a price from the client).
    const lres = await db.execute({
      sql: "SELECT id, title, price_usd FROM lessons WHERE id = ? AND published = 1 LIMIT 1",
      args: [lessonId],
    });
    if (!lres.rows.length) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    const lesson = lres.rows[0];
    const amount = Number(lesson.price_usd);

    const reference = `LSN${lessonId}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;

    // If Paynow isn't configured yet, fail clearly (so you know to add keys).
    if (!paynowConfigured()) {
      return NextResponse.json(
        { error: "Payments are not configured yet. Add your Paynow keys to enable checkout." },
        { status: 503 }
      );
    }

    let result;
    if (MOBILE_METHODS.includes(method)) {
      result = await createMobilePayment({
        reference,
        email,
        phone,
        amount,
        itemName: lesson.title,
        method,
      });
    } else {
      result = await createWebPayment({
        reference,
        email,
        amount,
        itemName: lesson.title,
      });
    }

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    // Record the pending payment.
    const ins = await db.execute({
      sql: `INSERT INTO payments
        (lesson_id, email, phone, method, amount, poll_url, paynow_reference, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'sent')`,
      args: [lessonId, email, phone || null, method, amount, result.pollUrl || null, reference],
    });
    const paymentId = Number(ins.lastInsertRowid);

    return NextResponse.json({
      paymentId,
      reference,
      // For web checkout, redirect the user here:
      redirectUrl: result.redirectUrl || null,
      // For mobile money, show these instructions and poll for status:
      instructions: result.instructions || null,
      method,
    });
  } catch (err) {
    console.error("pay initiate error", err);
    return NextResponse.json({ error: "Could not start payment" }, { status: 500 });
  }
}
