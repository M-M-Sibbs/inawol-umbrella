import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../lib/auth";

export const runtime = "nodejs";

// Media upload endpoint.
// In production we recommend Vercel Blob (S3/R2 compatible). To enable it:
//   1) `npm i @vercel/blob`
//   2) Add a Blob store in your Vercel project (sets BLOB_READ_WRITE_TOKEN).
//   3) Uncomment the block below.
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

    // --- Vercel Blob upload (recommended for Vercel deployment) ---
    // import { put } from "@vercel/blob";
    // const blob = await put(`projects/${Date.now()}-${file.name}`, file, {
    //   access: "public",
    // });
    // return NextResponse.json({ url: blob.url, kind });

    // Fallback when no blob store is configured: return a base64 data URL
    // so the flow works end-to-end in development.
    const buf = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${buf.toString("base64")}`;
    return NextResponse.json({
      url: dataUrl,
      kind,
      note: "Configure @vercel/blob for production storage.",
    });
  } catch (err) {
    console.error("upload error", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
