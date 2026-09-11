import { NextResponse } from "next/server";
import { db, ensureSchema } from "../../../../lib/db";
import { signPlaybackToken, streamIframeUrl } from "../../../../lib/stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Given a valid access token (from a paid payment), return a short-lived
// signed playback URL for the lesson's video. Without a paid token, denied.
export async function GET(req) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(req.url);
    const accessToken = searchParams.get("token");
    const lessonId = Number(searchParams.get("lessonId"));

    if (!accessToken || !Number.isInteger(lessonId)) {
      return NextResponse.json({ error: "Missing token or lesson" }, { status: 400 });
    }

    // Verify the token corresponds to a PAID payment for THIS lesson.
    const pres = await db.execute({
      sql: `SELECT id FROM payments
            WHERE access_token = ? AND lesson_id = ? AND status = 'paid' LIMIT 1`,
      args: [accessToken, lessonId],
    });
    if (!pres.rows.length) {
      return NextResponse.json({ error: "Access denied. Payment not found." }, { status: 403 });
    }

    const lres = await db.execute({
      sql: "SELECT stream_uid, title FROM lessons WHERE id = ? LIMIT 1",
      args: [lessonId],
    });
    if (!lres.rows.length || !lres.rows[0].stream_uid) {
      return NextResponse.json({ error: "Lesson video not available" }, { status: 404 });
    }

    // Sign a token that expires in 3 hours, then build the player URL.
    const signed = await signPlaybackToken(lres.rows[0].stream_uid, 3 * 3600);
    return NextResponse.json({
      iframeUrl: streamIframeUrl(signed),
      title: lres.rows[0].title,
    });
  } catch (err) {
    console.error("watch error", err);
    return NextResponse.json({ error: "Could not load video" }, { status: 500 });
  }
}
