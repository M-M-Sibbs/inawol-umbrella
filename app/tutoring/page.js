import Link from "next/link";
import Navbar from "../../components/Navbar";
import Chatbot from "../../components/Chatbot";
import Reveal from "../../components/Reveal";
import LessonGrid from "./LessonGrid";
import { db, ensureSchema } from "../../lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Online Tutoring — Inawol Umbrella Technologies",
  description:
    "Pay-per-lesson online tutoring with secure video lessons. Pay with EcoCash, InnBucks or OMari via Paynow and start learning instantly.",
};

async function getLessons() {
  try {
    await ensureSchema();
    const res = await db.execute(
      `SELECT id, title, subject, level, description, thumbnail_url,
              preview_seconds, price_usd, created_at
       FROM lessons WHERE published = 1 ORDER BY created_at DESC`
    );
    return res.rows;
  } catch {
    return [];
  }
}

export default async function TutoringPage() {
  const lessons = await getLessons();

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Chatbot />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="pointer-events-none absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-cyanglow/15 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Link href="/" className="text-sm text-white/50 hover:text-cyanglow transition">← Back home</Link>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyanglow/30 bg-cyanglow/5 px-4 py-1.5 text-xs font-medium text-cyanglow">
              <span className="h-1.5 w-1.5 rounded-full bg-cyanglow animate-glow" />
              Online Tutoring
            </span>
            <h1 className="mt-4 font-display text-5xl sm:text-6xl font-bold tracking-tight">
              Learn with <span className="text-gradient">expert-led</span> video lessons
            </h1>
            <p className="mt-4 max-w-2xl text-white/60">
              Pay only for the lessons you want. Secure checkout with EcoCash, InnBucks or
              OMari via Paynow — your video unlocks the instant payment is confirmed.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/50">
              <span className="rounded-full bg-white/5 px-3 py-1.5">🔒 Secure Paynow payments</span>
              <span className="rounded-full bg-white/5 px-3 py-1.5">▶ Streaming, not downloads</span>
              <span className="rounded-full bg-white/5 px-3 py-1.5">⚡ Instant access</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative pb-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <LessonGrid lessons={lessons} />
        </div>
      </section>
    </main>
  );
}
