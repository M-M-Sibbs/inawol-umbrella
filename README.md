# Inawol Umbrella Technologies

AI-first corporate website, project portfolio and lead-generation platform with a
conversational lead-capture chatbot. Built with **Next.js 14 (App Router)**, styled
after Sierra AI's premium dark/glassmorphism look, backed by **Turso (libSQL)**, and
ready to deploy on **Vercel**.

## Features

- **Sierra-inspired design** — deep-space dark theme, cyan AI glow, glassmorphism cards, animated neural-network hero, scroll reveals, sticky nav.
- **Five services** — AI Agents, Automation, Web, Mobile, AI Training.
- **Projects portfolio** (`/projects`) — live website / case study / demo links that open in new tabs, plus image **and video** media, tech tags, results and testimonials.
- **Lead-capture chatbot** — floating widget that welcomes, builds curiosity, understands needs, then softly captures **email** and **WhatsApp number** in a natural, interest-building conversation. Every lead is scored and stored.
- **Online tutoring** (`/tutoring`) — pay-per-lesson video courses with EcoCash / InnBucks / OMari via Paynow, secure Cloudflare Stream playback, and signed tokens tied to confirmed payments.
- **Secure admin dashboard** (`/dashboard`) — password-protected with server-side sessions, IP rate limiting, and security headers. Add, **edit and delete** projects, **upload images (≤20MB) and videos (≤500MB)**, and view all captured leads with scores.
- **API routes** — `/api/chat`, `/api/leads`, `/api/projects`, `/api/upload`.

## Tech stack

- Next.js 14 · React 18 · Tailwind CSS · Framer Motion
- Turso / libSQL (`@libsql/client`)
- Vercel (hosting) · Vercel Blob (optional media storage)

## Quick start

```bash
npm install
cp .env.example .env        # fill in Turso credentials (or leave blank for a local file DB)
npm run db:init             # creates tables + seeds sample projects
npm run dev                 # http://localhost:3000
```

Without Turso credentials the app uses a local `local.db` file so you can develop offline.

## Set up Turso

Create a database at [turso.tech](https://turso.tech) (the web dashboard is easiest — no CLI needed):

1. **Create Database**, name it `umbrella`, pick the nearest region.
2. Copy the **Database URL** → `TURSO_DATABASE_URL`
3. Click **Create Token**, copy it → `TURSO_AUTH_TOKEN`

Put both in `.env` (and in your Vercel project's Environment Variables), then run `npm run db:init`.

## Secure the admin dashboard

The dashboard lives at `/dashboard` and is locked down. Before you can sign in, set an admin password:

```bash
npm run admin:hash -- 'your-strong-password-here'
```

This prints a line like `ADMIN_PASSWORD_HASH=...` — copy it into your `.env` (and Vercel env vars). The password is never stored in plaintext; only a salted scrypt hash is kept.

Security measures built in:
- **Password hashing** — scrypt with a per-password random salt, constant-time comparison.
- **Server-side sessions** — login issues an HTTP-only, `SameSite=Lax`, Secure (in production) cookie backed by a session row in the database, so signing out truly invalidates the session.
- **IP rate limiting** — 5 failed attempts blocks that IP for 15 minutes.
- **Defense in depth** — the dashboard page re-checks the session server-side, and every mutating API (`create/edit/delete project`, `upload`, `leads`) verifies auth independently. Middleware also blocks the old `/admin` URL with a 404.
- **Security headers** — HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a strict Content-Security-Policy, and a locked-down `Permissions-Policy`, applied site-wide via `middleware.js`.
- **Obscure the URL (optional)** — set `ADMIN_PATH=/dashboard-something-random` in your env to move the dashboard off the default path entirely.

## Online tutoring (pay-per-lesson)

The `/tutoring` page sells individual video lessons. Students pay with **EcoCash,
InnBucks or OMari** through Paynow, and the video unlocks the moment payment is confirmed.

### 1. Paynow (payments)

Register as a merchant at [paynow.co.zw](https://www.paynow.co.zw), then set:

```
PAYNOW_INTEGRATION_ID=...
PAYNOW_INTEGRATION_KEY=...
PAYNOW_RESULT_URL=https://your-site.vercel.app/api/paynow/callback
PAYNOW_RETURN_URL=https://your-site.vercel.app/tutoring/return
```

The result URL is a server-to-server callback — Paynow posts payment confirmations
there directly, and every message is SHA512-signed and verified, so a payment can't
be faked from the browser. Prices are always read from the database, never the client.

### 2. Cloudflare Stream (secure video)

Create a Stream-enabled Cloudflare account and an API token with `Stream:Edit`:

```
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_STREAM_TOKEN=...
CLOUDFLARE_STREAM_KEY_ID=...      # optional but recommended
CLOUDFLARE_STREAM_KEY_JWK=...     # base64 of the JWK, for signed playback
```

Upload lesson videos from **Dashboard → Lessons**. The file goes straight from your
browser to Cloudflare (bypassing Vercel's upload size limits), and only the video ID
is stored in your database.

### How the download protection works

Videos are streamed as adaptive HLS, not served as a downloadable file, and playback
is gated behind short-lived signed tokens tied to a confirmed payment. The public
lesson list never exposes the video ID, and a token for one lesson cannot open another.

**An honest caveat:** no browser video can be made 100% download-proof — screen
recording always exists. This setup is the practical industry standard: it removes any
easy "save video" path, ties access to a real payment, and makes shared links expire.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add your environment variables (see `.env.example` for the full list).
4. (Optional) Create a **Blob store** in Vercel for project image uploads — this sets `BLOB_READ_WRITE_TOKEN` automatically.
5. Deploy. Tables are auto-created on first request, or run `npm run db:init` against the Turso DB.

## Media uploads

`app/api/upload/route.js` handles **project** images/videos (images 20MB, videos 500MB;
PNG/JPG/WEBP and MP4/MOV/WebM). It uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set,
and falls back to a base64 data URL locally.

Note that Vercel serverless functions cap request bodies at ~4.5MB, so large **project**
videos should be hosted elsewhere and linked via the "paste a media URL" field. **Lesson**
videos are unaffected — they upload directly to Cloudflare Stream.

## Chatbot

The conversation engine lives in `lib/chatbot.js` — a deterministic flow that runs
without any LLM key. To plug in a real model (Claude / GPT / Gemini) later, replace the
`nextTurn` logic with an LLM call while keeping the same staged structure and the
email/phone capture steps.

## Project structure

```
app/
  page.js              Homepage (hero, services, projects, contact)
  projects/page.js     Full portfolio
  dashboard/page.js    Secure admin dashboard (server auth guard)
  dashboard/Client.js  Dashboard UI: projects CRUD + leads
  dashboard/login      Admin login page
  api/                 chat · leads · projects · upload
components/            Navbar · Chatbot · NeuralBackground · Reveal
lib/                   db (Turso) · content · chatbot engine
scripts/init-db.mjs    schema + seed
```
