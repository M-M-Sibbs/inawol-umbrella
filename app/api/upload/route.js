import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../lib/auth";

export const runtime = "nodejs";
// Allow large request bodies (videos up to 500MB) on this route.
export const maxDuration = 60;

// Media upload endpoint.
// Uses Vercel Blob storage when BLOB_READ_WRITE_TOKEN is set (production).
// Falls back to a base64 data URL for local development only.
//
// Limits per spec: images up to 20MB, videos up to 500MB.
const MAX = {
  image: 20 * 1024 * 1024,
  video: 500 * 1024 * 1024,
};

const ALLOWED = {
  image: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
  video: ["video/mp4", "video/quicktime", "video/webm"], // mp4, mov, webm
};

export async function POST(req) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    const kind = form.get("kind") || "image"; // 'image' | 'video'

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED[kind]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported ${kind} type: ${file.type}` },
        { status: 415 }
      );
    }
    if (file.size > MAX[kind]) {
      return NextResponse.json(
        { error: `${kind} exceeds the ${MAX[kind] / 1024 / 1024}MB limit` },
        { status: 413 }
      );
    }

    // --- Vercel Blob upload (production) ---
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const safeName = (file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await put(`projects/${Date.now()}-${safeName}`, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return NextResponse.json({ url: blob.url, kind });
    }

    // --- Fallback for local dev (no blob store configured) ---
    const buf = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${buf.toString("base64")}`;
    return NextResponse.json({
      url: dataUrl,
      kind,
      note: "Using base64 fallback. Set BLOB_READ_WRITE_TOKEN for production storage.",
    });
  } catch (err) {
    console.error("upload error", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
