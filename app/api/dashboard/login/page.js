"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // We're at `${ADMIN_PATH}/login`; the dashboard is the parent path.
        // Deriving it here means a custom ADMIN_PATH needs no public env var.
        const base = window.location.pathname.replace(/\/login\/?$/, "") || "/dashboard";
        router.replace(base);
        router.refresh();
      } else {
        setErr(data.error || "Login failed");
      }
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-space flex items-center justify-center px-5">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="pointer-events-none absolute top-1/4 left-1/3 h-72 w-72 rounded-full bg-cyanglow/15 blur-[120px]" />

      <form
        onSubmit={submit}
        className="relative glass w-full max-w-sm rounded-2xl p-8"
        autoComplete="off"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyanglow to-[#7C5CFF]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-space" fill="currentColor">
              <path d="M12 1l3 6 6 1-4.5 4.5L18 19l-6-3-6 3 1.5-6.5L3 8l6-1 3-6z" />
            </svg>
          </span>
          <h1 className="font-display font-bold text-lg">Staff sign-in</h1>
        </div>

        <p className="text-sm text-white/55 mb-6">
          Restricted area. Enter your admin password to continue.
        </p>

        <label className="block text-xs text-white/60 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          minLength={8}
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyanglow/50"
          placeholder="••••••••"
        />

        {err && (
          <p className="mt-3 text-sm text-red-300/90 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !password}
          className="btn-glow mt-5 w-full rounded-lg bg-cyanglow py-2.5 text-sm font-semibold text-space disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <p className="mt-5 text-xs text-white/35 text-center">
          Five failed attempts will temporarily block this IP for 15 minutes.
        </p>
      </form>
    </main>
  );
}
