import Link from "next/link";
import Navbar from "../../components/Navbar";
import Chatbot from "../../components/Chatbot";
import Reveal from "../../components/Reveal";
import { db, ensureSchema } from "../../lib/db";

export const dynamic = "force-dynamic";

async function getProjects() {
  try {
    await ensureSchema();
    const res = await db.execute("SELECT * FROM projects ORDER BY created_at DESC");
    return res.rows;
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

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
            <h1 className="mt-4 font-display text-5xl sm:text-6xl font-bold tracking-tight">
              Our <span className="text-gradient">Projects</span>
            </h1>
            <p className="mt-4 max-w-2xl text-white/60">
              Completed work across AI agents, automation, web and mobile — with live links,
              demos and case studies.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative pb-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {projects.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-white/50">
              No projects yet. Once your administrator adds them they'll appear here.
            </div>
          ) : (
            <div className="grid gap-7 md:grid-cols-2">
              {projects.map((p, i) => (
                <Reveal key={p.id} delay={(i % 2) * 0.1}>
                  <article className="glass group h-full overflow-hidden rounded-3xl">
                    <div className="relative aspect-video overflow-hidden bg-space">
                      {p.media_type === "video" && p.media_url ? (
                        <video src={p.media_url} controls className="h-full w-full object-cover" playsInline />
                      ) : p.media_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.media_url} alt={p.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/30">No media</div>
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-space/80 px-3 py-1 text-xs text-cyanglow backdrop-blur">
                        {p.industry}
                      </span>
                    </div>

                    <div className="p-7">
                      <h2 className="font-display text-2xl font-bold">{p.title}</h2>
                      <p className="mt-2 text-white/60 leading-relaxed">{p.description}</p>

                      {p.problem && (
                        <p className="mt-4 text-sm text-white/50">
                          <span className="text-white/70 font-semibold">Problem: </span>{p.problem}
                        </p>
                      )}
                      {p.results && (
                        <p className="mt-1.5 text-sm text-cyanglow/90">
                          <span className="font-semibold">Results: </span>{p.results}
                        </p>
                      )}

                      {p.technologies && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {p.technologies.split(",").map((t, j) => (
                            <span key={j} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {p.testimonial && (
                        <blockquote className="mt-5 border-l-2 border-cyanglow/50 pl-4 text-sm italic text-white/70">
                          “{p.testimonial}”
                          {p.testimonial_author && (
                            <footer className="mt-1 not-italic text-xs text-white/40">— {p.testimonial_author}</footer>
                          )}
                        </blockquote>
                      )}

                      <div className="mt-6 flex flex-wrap gap-2.5">
                        {p.live_url && (
                          <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                            className="btn-glow rounded-full bg-cyanglow px-4 py-2 text-xs font-semibold text-space">
                            Visit Live Website →
                          </a>
                        )}
                        {p.case_study_url && (
                          <a href={p.case_study_url} target="_blank" rel="noopener noreferrer"
                            className="rounded-full border border-white/15 px-4 py-2 text-xs hover:border-cyanglow/50 transition">
                            Open Case Study
                          </a>
                        )}
                        {p.demo_url && (
                          <a href={p.demo_url} target="_blank" rel="noopener noreferrer"
                            className="rounded-full border border-white/15 px-4 py-2 text-xs hover:border-cyanglow/50 transition">
                            Watch Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
