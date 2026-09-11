"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const METHODS = [
  { id: "ecocash", label: "EcoCash", hint: "Mobile money" },
  { id: "innbucks", label: "InnBucks", hint: "Mobile wallet" },
  { id: "omari", label: "OMari", hint: "Mobile wallet" },
  { id: "web", label: "Card / Other", hint: "Paynow page" },
];

export default function Checkout({ lesson, onClose }) {
  const router = useRouter();
  const [method, setMethod] = useState("ecocash");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState("form"); // form | processing | paid | error
  const [message, setMessage] = useState("");
  const [instructions, setInstructions] = useState("");
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const needsPhone = ["ecocash", "innbucks", "omari"].includes(method);

  async function startPayment(e) {
    e.preventDefault();
    setMessage("");
    setStage("processing");
    try {
      const res = await fetch("/api/pay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, email, phone, method }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStage("error");
        setMessage(data.error || "Payment could not be started.");
        return;
      }

      // Web checkout → redirect to Paynow's hosted page.
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      // Mobile money → show instructions and poll for confirmation.
      setInstructions(data.instructions || "Check your phone to approve the payment.");
      pollStatus(data.paymentId);
    } catch {
      setStage("error");
      setMessage("Network error. Please try again.");
    }
  }

  function pollStatus(paymentId) {
    let tries = 0;
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      tries += 1;
      try {
        const r = await fetch(`/api/pay/status?paymentId=${paymentId}`);
        const d = await r.json();
        if (d.status === "paid" && d.accessToken) {
          clearInterval(pollRef.current);
          setStage("paid");
          // Persist access so the student can return to the lesson.
          try {
            const key = `lesson_access_${lesson.id}`;
            localStorage.setItem(key, d.accessToken);
          } catch {}
          setTimeout(() => {
            router.push(`/tutoring/watch?lessonId=${lesson.id}&token=${d.accessToken}`);
          }, 1200);
        } else if (["cancelled", "failed"].includes(d.status)) {
          clearInterval(pollRef.current);
          setStage("error");
          setMessage("Payment was not completed. You can try again.");
        }
      } catch {
        // keep polling
      }
      // Give up after ~3 minutes.
      if (tries > 60) {
        clearInterval(pollRef.current);
        setStage("error");
        setMessage("We didn't get confirmation in time. If you were charged, contact us and we'll unlock it.");
      }
    }, 3000);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-2xl p-6">
        <button onClick={onClose} className="absolute right-4 top-4 text-white/50 hover:text-white">✕</button>
        <p className="text-xs uppercase tracking-wide text-cyanglow">Enroll in lesson</p>
        <h3 className="mt-1 font-display text-xl font-bold">{lesson.title}</h3>
        <p className="mt-1 text-2xl font-bold text-gradient">${Number(lesson.price_usd).toFixed(2)}</p>

        {stage === "form" && (
          <form onSubmit={startPayment} className="mt-5 space-y-4">
            <div>
              <label className="text-xs text-white/60 mb-2 block">Payment method</label>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`rounded-lg border px-3 py-2.5 text-left transition ${
                      method === m.id
                        ? "border-cyanglow bg-cyanglow/10"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-[11px] text-white/45">{m.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-white/60 mb-1.5 block">Email (for your receipt & access)</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm outline-none focus:border-cyanglow/50"
              />
            </div>

            {needsPhone && (
              <div>
                <label className="text-xs text-white/60 mb-1.5 block">
                  {method === "ecocash" ? "EcoCash" : method === "innbucks" ? "InnBucks" : "OMari"} number
                </label>
                <input
                  type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm outline-none focus:border-cyanglow/50"
                />
              </div>
            )}

            <button type="submit"
              className="btn-glow w-full rounded-lg bg-cyanglow py-3 text-sm font-semibold text-space">
              Pay ${Number(lesson.price_usd).toFixed(2)}
            </button>
            <p className="text-[11px] text-white/40 text-center">
              Secured by Paynow. Your video unlocks the moment payment is confirmed.
            </p>
          </form>
        )}

        {stage === "processing" && (
          <div className="mt-6 text-center py-6">
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-cyanglow/30 border-t-cyanglow animate-spin" />
            <p className="mt-4 text-sm text-white/70">
              {instructions || "Starting payment…"}
            </p>
            {instructions && (
              <p className="mt-2 text-xs text-white/45">
                Waiting for confirmation — keep this window open.
              </p>
            )}
          </div>
        )}

        {stage === "paid" && (
          <div className="mt-6 text-center py-6">
            <div className="mx-auto h-12 w-12 rounded-full bg-cyanglow/20 flex items-center justify-center text-cyanglow text-2xl">✓</div>
            <p className="mt-3 font-semibold">Payment confirmed!</p>
            <p className="text-sm text-white/60">Opening your lesson…</p>
          </div>
        )}

        {stage === "error" && (
          <div className="mt-6">
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {message}
            </p>
            <button onClick={() => setStage("form")}
              className="mt-4 w-full rounded-lg border border-white/15 py-2.5 text-sm hover:border-cyanglow/50">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
