# SEO Plan — getting inawol.store found on Google

Read this honestly, because it's the difference between results and wasted effort.

## The honest truth about rankings

**You cannot buy or guarantee a #1 global ranking for broad terms** like
"software development", "website development" or "AI development". Those searches
are owned by companies with 20+ years of domain authority and millions in
spend (AWS, IBM, Microsoft, Coursera, Upwork). A brand-new site will not outrank
them worldwide, and anyone who promises that is lying to you.

**What you _can_ win — and what actually brings paying clients — is intent + geo
targeting.** Someone typing "software development company near me" or "hire AI
developer Zimbabwe" or "AI training for my team" is a buyer. Those are the
searches we aim for, and they're very winnable.

Think of it as three rings:

| Ring | Example query | Realistic? | Value |
|---|---|---|---|
| 🟢 Geo + intent | "AI agent development Zimbabwe", "web developer Harare" | **Yes, within months** | Highest — real leads |
| 🟡 Niche + intent | "WhatsApp AI agent for retail", "LMS developer Africa" | Yes, with content | High |
| 🔴 Broad global | "software development", "ai development" | No (not for years, if ever) | Low — mostly tyre-kickers |

The site is now built to dominate the 🟢 and 🟡 rings everywhere, and to show up
globally for your **brand + niche** combinations.

---

## What's already done in the code ✅

- **Per-service landing pages** at `/services/ai-agent-development`,
  `/business-automation`, `/website-development`, `/mobile-app-development`,
  `/ai-training` — each with its own keyword-targeted title, description and FAQ.
  (Google ranks *pages*, not sites — one page per thing you sell.)
- **Dynamic `sitemap.xml`** listing every page + project.
- **`robots.txt`** allowing crawl, pointing to the sitemap, blocking `/admin`.
- **Structured data (JSON-LD):** Organization / ProfessionalService, WebSite,
  Service, Breadcrumbs, and FAQ schema → eligible for rich results and a
  knowledge panel.
- **Open Graph + Twitter cards** with a branded `og.png` so shared links look pro.
- **Canonical URLs, metadata templates, geo keywords** (Zimbabwe, Harare,
  Southern Africa) baked into every page.
- **Fast, mobile-first, server-rendered** Next.js — Core Web Vitals friendly,
  which Google rewards.

---

## What YOU must do (this is where rankings are actually won)

Code is maybe 20% of SEO. The other 80% is below. Do these in order.

### 1. Google Search Console — do this day one
1. Go to https://search.google.com/search-console → add property `inawol.store`.
2. Verify. Easiest two options:
   - **HTML tag:** copy the verification string Google gives you into the Vercel
     env var `NEXT_PUBLIC_GOOGLE_VERIFICATION` (the layout already outputs the
     meta tag), redeploy, then click Verify.
   - **DNS TXT:** in Namecheap → Advanced DNS → Add New Record → **TXT Record**,
     Host `@`, Value = the string Google gives you. Save, then Verify.
3. Submit your sitemap: enter `sitemap.xml` → Submit.
4. Use **URL Inspection → Request indexing** for your homepage and each service
   page. This gets you crawled in days, not weeks.

Also add the site to **Bing Webmaster Tools** (https://www.bing.com/webmasters) —
quick, and covers Bing + ChatGPT search.

### 2. Google Business Profile — your biggest local lever
1. Create a free profile at https://www.google.com/business for
   "Inawol Umbrella Technologies", category **Software company** +
   **Website designer** + **Business management consultant**.
2. Add Harare location/service area, phone, hours, inawol.store link, photos.
3. This is what makes you appear in the **map pack** and for "near me" searches —
   often the #1 source of local B2B leads. Get a few client reviews here fast.

### 3. Fill the site with real content
Google can't rank an empty shell. Replace the placeholder data in `/admin`:
- Add **every real project** with real screenshots, results and the live URL.
  Each project page is an indexable asset targeting its industry.
- Replace seed testimonials with real client quotes (and names/companies if you
  can — real names rank and convert better).

### 4. Start a blog / resources section (content marketing)
This is how you rank for the long tail and build authority. Write one useful
article a week aimed at a real search:
- "How much does a website cost in Zimbabwe in 2026?"
- "What is an AI agent, and how can a Zimbabwean business use one?"
- "5 tasks every Harare business should automate first"
- "Best way to train your team in AI (a practical guide)"

Each targets searches your competitors ignore. (The admin already lists
blog-post management as a feature to build out — prioritise it.)

### 5. Backlinks — the real ranking currency
Rankings largely come down to **who links to you**. Get listed / mentioned on:
- Zimbabwe business directories (Yellow Pages ZW, local chambers of commerce).
- Tech directories: Clutch, GoodFirms, DesignRush (great for "development company"
  intent searches, and they rank globally).
- LinkedIn company page + regular posts linking back.
- Guest posts / interviews on local tech blogs and news sites.
- Partner/client sites ("Website by Umbrella Technologies →" footer link).

Quality over quantity — ten relevant links beat a hundred spammy ones.

### 6. Analytics
Add **Google Analytics 4** (or Vercel Analytics, one click in the Vercel
dashboard) so you can see which keywords and pages bring leads, and double down.

---

## Realistic timeline

| When | What to expect |
|---|---|
| Week 1 | Indexed in Google/Bing; you rank for "Inawol Umbrella Technologies" (your brand). |
| Month 1–2 | Google Business Profile starts surfacing you for local "near me" searches. |
| Month 2–4 | Begin ranking for long-tail geo terms if you publish content + get a few backlinks. |
| Month 4–9 | Competitive for "AI/web/app development Zimbabwe"-type terms with sustained content + links. |
| Broad global terms | Not realistically — focus energy where it pays. |

SEO compounds. The sites that win are the ones that keep publishing and keep
earning links. The technical foundation is done — consistency does the rest.

---

## Quick-reference: target keywords built into the site

**Geo (where you can win):** AI agent development Zimbabwe · AI automation
Zimbabwe · website development Zimbabwe · web development company Harare · mobile
app development Zimbabwe · AI training Zimbabwe · AI lessons Zimbabwe · AI
consulting Zimbabwe · software development company Zimbabwe · AI developers
Southern Africa

**Global (secondary context):** AI agent development · AI automation company ·
custom AI development · AI chatbot development · software development company
