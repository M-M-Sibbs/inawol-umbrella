import Link from "next/link";
import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import NeuralBackground from "../components/NeuralBackground";
import Reveal from "../components/Reveal";
import { COMPANY, METRICS, SERVICES } from "../lib/content";
import { db, ensureSchema } from "../lib/db";

export const dynamic = "force-dynamic";

async function getProjects() {
  try {
    await ensureSchema();
    const res = await db.execute(
      "SELECT * FROM projects ORDER BY created_at DESC LIMIT 3"
    );
    return res.rows;
  } catch {
    return [];
  }
}

export default async function Home() {
  const projects = await getProjects();

  return (
    <main className="relative">
      <Navbar />
      <Chatbot />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0">
          <NeuralBackground />
        </div>
        {/* ambient glows */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyanglow/20 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-[#7C5CFF]/20 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 pt-28 pb-20">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyanglow/30 bg-cyanglow/5 px-4 py-1.5 text-xs font-medium text-cyanglow">
              <span className="h-1.5 w-1.5 rounded-full bg-cyanglow animate-glow" />
              AI Agent Development · {COMPANY.location}
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl font-display font-bold tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[1.02]">
              <span className="text-gradient">AI Agents</span> That Work
              <br className="hidden sm:block" /> While You Sleep.
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg text-white/65 leading-relaxed">
              {COMPANY.subtext}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="/#contact"
                className="btn-glow rounded-full bg-cyanglow px-7 py-3.5 text-sm font-semibold text-space"
              >
                Book Strategy Call
              </a>
              <Link
                href="/projects"
                className="rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white hover:border-cyanglow/50 hover:text-cyanglow transition"
              >
                Explore Projects →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TRUST / METRICS */}
      <section className="relative border-y border-white/5 bg-slate2/20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
          <Reveal>
            <p className="text-center text-xs uppercase tracking-[0.2em] text-white/40">
              Trusted by businesses & institutions across Southern Africa
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {METRICS.map((m, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="glass rounded-2xl p-6 text-center">
                  <p className="font-display text-4xl font-bold text-gradient">{m.value}</p>
                  <p className="mt-2 text-sm text-white/55">{m.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
              Everything you need to <span className="text-gradient-purple">go AI-first</span>
            </h2>
            <p className="mt-4 max-w-2xl text-white/60">
              Five capabilities, one partner. We design, build and ship the systems that make
              your business operate faster, smarter and more profitably.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {SERVICES.map((s, i) => (
              <Reveal key={s.id} delay={(i % 2) * 0.1}>
                <div id={`service-${s.id}`} className="glass group h-full rounded-3xl p-8 transition duration-300 hover:-translate-y-1 scroll-mt-24">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl font-bold">{s.title}</h3>
                    <span className="text-cyanglow opacity-0 group-hover:opacity-100 transition">↗</span>
                  </div>
                  <p className="mt-3 text-white/60 leading-relaxed">{s.blurb}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {s.items.map((it, j) => (
                      <li
                        key={j}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/#contact"
                    className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-cyanglow hover:gap-3 transition-all"
                  >
                    {s.cta} →
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS PREVIEW */}
      <section className="relative py-24 border-t border-white/5 bg-slate2/20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
                  Recent <span className="text-gradient">work</span>
                </h2>
                <p className="mt-4 max-w-xl text-white/60">
                  Live systems delivering measurable results. Click through to see them running.
                </p>
              </div>
              <Link
                href="/projects"
                className="hidden sm:inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold hover:border-cyanglow/50 hover:text-cyanglow transition"
              >
                View all →
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {projects.length === 0 ? (
              <div className="md:col-span-3 glass rounded-2xl p-10 text-center text-white/50">
                Projects will appear here once added by an administrator
                or seeded with <code className="text-cyanglow">npm run db:init</code>.
              </div>
            ) : (
              projects.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.1}>
                  <article className="glass group h-full overflow-hidden rounded-2xl">
                    <div className="relative aspect-video overflow-hidden bg-space">
                      {p.media_type === "video" && p.media_url ? (
                        <video src={p.media_url} className="h-full w-full object-cover" muted loop playsInline />
                      ) : p.media_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.media_url} alt={p.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/30">No media</div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-xs uppercase tracking-wide text-cyanglow">{p.industry}</p>
                      <h3 className="mt-1.5 font-display text-xl font-bold">{p.title}</h3>
                      <p className="mt-2 text-sm text-white/55 line-clamp-2">{p.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {p.live_url && (
                          <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                            className="rounded-full bg-cyanglow px-3.5 py-1.5 text-xs font-semibold text-space">
                            Visit Live →
                          </a>
                        )}
                        {p.case_study_url && (
                          <a href={p.case_study_url} target="_blank" rel="noopener noreferrer"
                            className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs hover:border-cyanglow/50 transition">
                            Case Study
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="relative py-24 scroll-mt-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
              “{COMPANY.short} builds AI agents, intelligent automations and digital products
              that help organizations operate <span className="text-gradient">faster, smarter and more profitably</span>.”
            </h2>
          </Reveal>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative py-24 border-t border-white/5 scroll-mt-24">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
          <div className="glass rounded-3xl p-10 sm:p-14 text-center">
            <Reveal>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
                Discover what AI can do for <span className="text-gradient-purple">you</span>
              </h2>
              <p className="mt-4 mx-auto max-w-xl text-white/60">
                Book a strategy call and we'll map the highest-impact AI opportunities for your
                business — no jargon, no pressure.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a href={`mailto:${COMPANY.email}`}
                  className="btn-glow rounded-full bg-cyanglow px-7 py-3.5 text-sm font-semibold text-space">
                  Book Strategy Call
                </a>
                <span className="text-sm text-white/50">
                  or chat with our AI — bottom right ↘
                </span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-space">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display font-bold">Inawol Umbrella Technologies</p>
            <p className="text-sm text-white/45 mt-1">{COMPANY.location} · {COMPANY.email}</p>
          </div>
          <p className="text-sm text-white/40">© {new Date().getFullYear()} Umbrella Technologies. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
