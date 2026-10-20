# Deploy to inawol.store (Vercel + Turso)

This is the exact, click-by-click path to get the site live on **inawol.store**.
You'll do these steps in your own accounts — I can't reach your Vercel, domain
registrar or database from here, but everything in the code is already wired for it.

Total time: ~30–45 minutes.

---

## 0. What you need first

- A **GitHub** account (free).
- A **Vercel** account (free) — sign in with GitHub.
- A **Turso** account (free) — https://turso.tech
- Access to wherever **inawol.store** is registered (the registrar dashboard where
  you bought the domain — e.g. Namecheap, GoDaddy, Cloudflare, Afrihost, etc.).
- One AI key for the chatbot: Anthropic, OpenAI **or** Gemini (optional — the bot
  works on a scripted flow without one).

---

## 1. Put the code on GitHub

From the unzipped project folder:

```bash
git init
git add .
git commit -m "Umbrella Technologies website"
```

Create an empty repo on github.com (e.g. `umbrella-technologies`), then:

```bash
git remote add origin https://github.com/<your-username>/umbrella-technologies.git
git branch -M main
git push -u origin main
```

---

## 2. Create the Turso database

Install the CLI and create the DB (pick a region close to your users — e.g.
`fra` Frankfurt or `jnb` if available):

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup          # or: turso auth login

turso db create umbrella --location fra
turso db show umbrella --url          # copy -> TURSO_DATABASE_URL
turso db tokens create umbrella       # copy -> TURSO_AUTH_TOKEN
```

Create the tables and seed example projects (run locally once, pointed at prod):

```bash
export TURSO_DATABASE_URL="libsql://umbrella-....turso.io"
export TURSO_AUTH_TOKEN="ey...."
npm install
npm run db:init
```

You should see "Schema ready." and "Seeded 4 projects."

---

## 3. Import the project into Vercel

1. Go to https://vercel.com/new
2. Pick your `umbrella-technologies` GitHub repo → **Import**.
3. Framework preset: **Next.js** (auto-detected). Leave build settings default.
4. Before deploying, open **Environment Variables** and add:

| Name | Value |
|---|---|
| `TURSO_DATABASE_URL` | your `libsql://…` url |
| `TURSO_AUTH_TOKEN` | your token |
| `ADMIN_PASSWORD` | a strong password for /admin |
| `NEXT_PUBLIC_SITE_URL` | `https://inawol.store` |
| `ANTHROPIC_API_KEY` *(or OPENAI/GEMINI)* | optional, for the smart chatbot |
| `BLOB_READ_WRITE_TOKEN` | after step 5, for uploads |

5. Click **Deploy**. You'll get a temporary URL like `umbrella-xxxx.vercel.app`.
   Check it works.

---

## 4. Attach the inawol.store domain (Namecheap → Vercel)

Vercel stays the host. Namecheap only points the domain at Vercel.

**Step A — add the domain in Vercel:**
1. Your project → **Settings → Domains**.
2. Type `inawol.store` → **Add**.
3. When asked, choose to also add `www.inawol.store` and let Vercel **redirect
   www → inawol.store** (recommended).
4. Vercel now shows the records to create. For a Namecheap domain the values are:
   - Root `inawol.store` → **A record** → `76.76.21.21`
   - `www` → **CNAME** → `cname.vercel-dns.com`
   (Use whatever Vercel displays on your screen if it differs — follow Vercel's
   values, not these, if there's ever a mismatch.)

**Step B — set the DNS in Namecheap:**
1. Log in to Namecheap → **Domain List** → click **Manage** next to `inawol.store`.
2. Open the **Advanced DNS** tab.
3. Under **Host Records**, delete any default **CNAME/URL Redirect/parking**
   records Namecheap added (e.g. a `www` CNAME to `parkingpage`, or an `@`
   URL-redirect). Leave MX/email records alone if you use Namecheap email.
4. Click **Add New Record** and create these two:

   | Type | Host | Value | TTL |
   |---|---|---|---|
   | A Record | `@` | `76.76.21.21` | Automatic |
   | CNAME Record | `www` | `cname.vercel-dns.com.` | Automatic |

   (Namecheap's **Host** field uses `@` for the root domain. The trailing dot on
   the CNAME is fine.)
5. Click the green **✓ Save All Changes**.

> ⚠️ Do **not** change Namecheap's **Nameservers** (keep "Namecheap BasicDNS").
> You're only adding host records — that's what keeps Vercel as the host while
> Namecheap just directs traffic there.

**Step C — wait and verify:**
- Propagation is usually 5–30 minutes on Namecheap (can be up to a few hours).
- Back in Vercel → Settings → Domains, the status flips to **Valid
  Configuration** and Vercel auto-issues the SSL certificate.
- `https://inawol.store` is now live, hosted on Vercel. ✅

**Tip:** if Vercel offers "Nameservers" instead of records, you *can* switch
Namecheap to Vercel's nameservers (Domain tab → Nameservers → Custom DNS), but
the two host records above are simpler and keep your Namecheap email intact.

---

## 5. Turn on file uploads (images & videos)

Vercel's filesystem is read-only, so uploads need object storage. Easiest is
**Vercel Blob**:

1. Vercel project → **Storage → Create → Blob**.
2. It adds `BLOB_READ_WRITE_TOKEN` to your env automatically.
3. In `app/api/upload/route.js`, uncomment the **Option A (Vercel Blob)** block
   and comment out the final "no storage configured" return.
4. `npm i @vercel/blob`, commit, push. Vercel redeploys.

(Prefer Cloudflare R2 / S3? Option B in the same file has the hooks — set your
bucket env vars and `npm i @aws-sdk/client-s3`.)

---

## 6. Go-live checklist

- [ ] `https://inawol.store` loads with the padlock (SSL).
- [ ] `https://inawol.store/sitemap.xml` returns XML.
- [ ] `https://inawol.store/robots.txt` returns rules + sitemap line.
- [ ] `/admin` login works with your `ADMIN_PASSWORD`.
- [ ] Chatbot opens and replies.
- [ ] A test project added in /admin shows on /projects.

Next: open **SEO.md** and work the ranking plan — that's what actually gets you
found on Google.
