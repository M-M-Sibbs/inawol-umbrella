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

```bash
# install the CLI: https://docs.turso.tech
turso db create umbrella
turso db show umbrella --url            # -> TURSO_DATABASE_URL
turso db tokens create umbrella         # -> TURSO_AUTH_TOKEN
```

Put both values in `.env` (and in your Vercel project's Environment Variables), then run `npm run db:init`.

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

## Set up Turso

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add environment variables: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`.
4. (Optional) Create a **Blob store** in Vercel for production media uploads — this sets `BLOB_READ_WRITE_TOKEN` automatically. Then enable the Blob block in `app/api/upload/route.js` and run `npm i @vercel/blob`.
5. Deploy. After the first deploy, run `npm run db:init` locally against the Turso DB (or call the API once) to create tables — tables are also auto-created on first request.

## Media uploads

`app/api/upload/route.js` enforces the spec limits (images 20MB, videos 500MB) and
accepts PNG/JPG/WEBP for images and MP4/MOV/WebM for videos. In development it returns
a base64 data URL so the flow works offline; in production switch on the Vercel Blob
block (commented in the file) for real object storage.

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
