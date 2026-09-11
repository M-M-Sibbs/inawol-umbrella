import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../../lib/auth";
import { streamConfigured, createDirectUpload } from "../../../../lib/stream";

export const runtime = "nodejs";

// Admin-only: returns a one-time upload URL. The browser uploads the video
// file straight to Cloudflare (bypassing our server / Vercel's size limits),
// then we store the returned UID on the lesson.
export async function POST(req) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!streamConfigured()) {
    return NextResponse.json(
      { error: "Cloudflare Stream is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_TOKEN." },
      { status: 503 }
    );
  }
  try {
    const b = await req.json().catch(() => ({}));
    const result = await createDirectUpload({ name: b.name });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    return NextResponse.json({ uploadURL: result.uploadURL, uid: result.uid });
  } catch (err) {
    console.error("stream upload error", err);
    return NextResponse.json({ error: "Upload init failed" }, { status: 500 });
  }
}
