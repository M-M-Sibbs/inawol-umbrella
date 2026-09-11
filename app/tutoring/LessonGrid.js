"use client";
import { useState } from "react";
import Checkout from "./Checkout";

export default function LessonGrid({ lessons }) {
  const [active, setActive] = useState(null);

  if (!lessons.length) {
    return (
      <div className="glass rounded-2xl p-12 text-center text-white/50">
        Lessons are being prepared. Check back soon.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((l) => (
          <article key={l.id} className="glass group flex flex-col overflow-hidden rounded-2xl">
            <div className="relative aspect-video overflow-hidden bg-space">
              {l.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.thumbnail_url} alt={l.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-white/25">
                  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
              {l.preview_seconds > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-space/80 px-2.5 py-1 text-[11px] text-cyanglow backdrop-blur">
                  {l.preview_seconds}s free preview
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center gap-2 text-[11px] text-white/45">
                {l.subject && <span className="rounded-full bg-white/5 px-2 py-0.5">{l.subject}</span>}
                {l.level && <span className="rounded-full bg-white/5 px-2 py-0.5">{l.level}</span>}
              </div>
              <h3 className="mt-2 font-display text-lg font-bold">{l.title}</h3>
              <p className="mt-1.5 text-sm text-white/55 line-clamp-2 flex-1">{l.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-gradient">
                  ${Number(l.price_usd).toFixed(2)}
                </span>
                <button onClick={() => setActive(l)}
                  className="btn-glow rounded-full bg-cyanglow px-4 py-2 text-xs font-semibold text-space">
                  Enroll & Watch →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {active && <Checkout lesson={active} onClose={() => setActive(null)} />}
    </>
  );
}
