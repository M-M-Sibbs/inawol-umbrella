"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ReturnInner() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get("paymentId");
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!paymentId) { setStatus("unknown"); return; }
    let tries = 0;
    const iv = setInterval(async () => {
      tries += 1;
      try {
        const r = await fetch(`/api/pay/status?paymentId=${paymentId}`);
        const d = await r.json();
        if (d.status === "paid" && d.accessToken) {
          clearInterval(iv);
          try { localStorage.setItem(`lesson_access_${d.lessonId}`, d.accessToken); } catch {}
          router.push(`/tutoring/watch?lessonId=${d.lessonId}&token=${d.accessToken}`);
        } else if (["cancelled", "failed"].includes(d.status) || tries > 20) {
          clearInterval(iv);
          setStatus("failed");
        }
      } catch {}
    }, 3000);
    return () => clearInterval(iv);
  }, [paymentId, router]);

  return (
    <main className="min-h-screen bg-space flex items-center justify-center px-5">
      <div className="glass rounded-2xl p-10 text-center max-w-md">
        {status === "checking" && (
          <>
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-cyanglow/30 border-t-cyanglow animate-spin" />
            <p className="mt-4 font-semibold">Confirming your payment…</p>
            <p className="text-sm text-white/55">This only takes a few seconds.</p>
          </>
        )}
        {status === "failed" && (
          <>
            <p className="font-semibold text-red-300">We couldn't confirm the payment.</p>
            <p className="text-sm text-white/55 mt-1">If you were charged, contact us and we'll unlock your lesson.</p>
            <Link href="/tutoring" className="mt-5 inline-block rounded-full bg-cyanglow px-5 py-2.5 text-sm font-semibold text-space">
              Back to lessons
            </Link>
          </>
        )}
        {status === "unknown" && (
          <>
            <p className="font-semibold">Nothing to confirm here.</p>
            <Link href="/tutoring" className="mt-5 inline-block rounded-full bg-cyanglow px-5 py-2.5 text-sm font-semibold text-space">
              Browse lessons
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function ReturnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-space" />}>
      <ReturnInner />
    </Suspense>
  );
}
