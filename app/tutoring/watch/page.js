"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function WatchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const lessonId = params.get("lessonId");
  const tokenFromUrl = params.get("token");

  const [iframeUrl, setIframeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prefer the token in the URL; fall back to one saved after purchase.
    let token = tokenFromUrl;
    if (!token && lessonId) {
      try { token = localStorage.getItem(`lesson_access_${lessonId}`); } catch {}
    }
    if (!token || !lessonId) {
      setError("No access token found. Please purchase the lesson to watch.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const r = await fetch(`/api/lessons/watch?lessonId=${lessonId}&token=${token}`);
        const d = await r.json();
        if (!r.ok) {
          setError(d.error || "Could not load the lesson.");
        } else {
          setIframeUrl(d.iframeUrl);
          setTitle(d.title || "");
          // Save token for return visits.
          try { localStorage.setItem(`lesson_access_${lessonId}`, token); } catch {}
        }
      } catch {
        setError("Network error loading the lesson.");
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId, tokenFromUrl]);

  // Deter casual saving: block context menu on the player area.
  useEffect(() => {
    const block = (e) => e.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  return (
    <main className="min-h-screen bg-space">
      <div className="border-b border-white/5 bg-space/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/tutoring" className="text-sm text-white/50 hover:text-cyanglow">← All lessons</Link>
          <span className="font-display font-bold text-sm truncate max-w-[60%]">{title}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 sm:px-8 py-10">
        {loading && (
          <div className="aspect-video rounded-2xl glass flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-2 border-cyanglow/30 border-t-cyanglow animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-red-300">{error}</p>
            <Link href="/tutoring"
              className="mt-5 inline-block rounded-full bg-cyanglow px-5 py-2.5 text-sm font-semibold text-space">
              Browse lessons
            </Link>
          </div>
        )}

        {!loading && iframeUrl && (
          <>
            <div className="relative aspect-video overflow-hidden rounded-2xl glass select-none">
              <iframe
                src={iframeUrl}
                className="absolute inset-0 h-full w-full"
                allow="accelerated-2d-canvas; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
            <p className="mt-4 text-xs text-white/40 text-center">
              This lesson is licensed for your personal use. Sharing or redistributing the
              video is prohibited and access is traced to your purchase.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-space" />}>
      <WatchInner />
    </Suspense>
  );
}
