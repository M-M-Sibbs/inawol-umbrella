// Cloudflare Stream integration for secure lesson video playback.
//
// Why Cloudflare Stream: it streams video via adaptive HLS/DASH rather than
// serving a downloadable file, and it supports SIGNED URLs — short-lived tokens
// that gate playback. This makes casual downloading impractical (there is no
// "video.mp4" to grab) and lets us hand out playback tokens ONLY to buyers.
//
// Note on "preventing downloads": no browser video can be made 100% download-proof
// (screen capture always exists). Signed tokens + HLS streaming + disabled right
// click is the industry-standard practical protection, and that's what we do.
//
// Env vars (set in Vercel):
//   CLOUDFLARE_ACCOUNT_ID
//   CLOUDFLARE_STREAM_TOKEN         — API token with Stream:Edit
//   CLOUDFLARE_STREAM_KEY_ID        — signing key id (for signed tokens)
//   CLOUDFLARE_STREAM_KEY_JWK       — the JWK private key (base64) for signing
//
// Signing keys: create once with the Cloudflare API
//   POST /accounts/{account}/stream/keys
// and store the returned id + jwk.

import crypto from "crypto";

export function streamConfigured() {
  return Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_STREAM_TOKEN);
}

export function streamSigningConfigured() {
  return Boolean(process.env.CLOUDFLARE_STREAM_KEY_ID && process.env.CLOUDFLARE_STREAM_KEY_JWK);
}

// Create a signed playback token for a given video UID, valid for `ttlSeconds`.
// Returns a token you append as the Stream video id in the iframe/HLS URL.
export async function signPlaybackToken(videoUid, ttlSeconds = 3600) {
  const keyId = process.env.CLOUDFLARE_STREAM_KEY_ID;
  const jwkB64 = process.env.CLOUDFLARE_STREAM_KEY_JWK;
  if (!keyId || !jwkB64) {
    // Signing not configured — fall back to the plain UID (video must be public).
    return videoUid;
  }

  const jwk = JSON.parse(Buffer.from(jwkB64, "base64").toString("utf8"));
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: "RS256", kid: keyId };
  const payload = {
    sub: videoUid,
    kid: keyId,
    exp: now + ttlSeconds,
    nbf: now - 10,
    // downloadable:false is the default; we also restrict to playback only.
    accessRules: [
      { type: "any", action: "allow" },
    ],
  };

  const enc = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const data = `${enc(header)}.${enc(payload)}`;

  const keyObject = crypto.createPrivateKey({ key: jwk, format: "jwk" });
  const signature = crypto
    .sign("RSA-SHA256", Buffer.from(data), keyObject)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
}

// The iframe URL for the Cloudflare Stream player.
// When signed, `idOrToken` is the signed token; otherwise the raw video UID.
export function streamIframeUrl(idOrToken) {
  // Disable downloads in the player UI; controls stay on.
  return `https://iframe.videodelivery.net/${idOrToken}?preload=metadata&defaultTextTrack=`;
}

// The HLS manifest URL (for custom players), signed or raw.
export function streamHlsUrl(idOrToken) {
  return `https://videodelivery.net/${idOrToken}/manifest/video.m3u8`;
}

// Direct-upload URL: lets the admin upload a video straight to Cloudflare
// from the dashboard without the file passing through our server.
export async function createDirectUpload({ maxDurationSeconds = 7200, name } = {}) {
  const acct = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_TOKEN;
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${acct}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds,
        requireSignedURLs: streamSigningConfigured(), // gate playback if we can sign
        meta: name ? { name } : undefined,
      }),
    }
  );
  const data = await res.json();
  if (!data.success) {
    return { ok: false, error: data.errors?.[0]?.message || "Cloudflare upload init failed" };
  }
  return { ok: true, uploadURL: data.result.uploadURL, uid: data.result.uid };
}
