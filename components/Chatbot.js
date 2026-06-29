"use client";
import { useEffect, useRef, useState } from "react";

function newSession() {
  return "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stage, setStage] = useState("welcome");
  const [lead, setLead] = useState({});
  const [options, setOptions] = useState(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const sessionRef = useRef(null);
  const scrollRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    sessionRef.current = newSession();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  // Kick off the welcome message the first time the panel opens.
  useEffect(() => {
    if (open && !startedRef.current) {
      startedRef.current = true;
      send("", "welcome");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function send(text, forcedStage) {
    const useStage = forcedStage || stage;
    if (text) {
      setMessages((m) => [...m, { role: "user", text }]);
    }
    setOptions(null);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          stage: useStage,
          message: text,
          lead,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((m) => [...m, { role: "bot", text: data.reply }]);
      }
      if (data.nextStage) setStage(data.nextStage);
      if (data.lead) setLead(data.lead);
      if (data.options) setOptions(data.options);
      if (data.finished) setFinished(true);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "bot", text: "Connection hiccup — mind trying that again?" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function submit(e) {
    e?.preventDefault();
    const t = input.trim();
    if (!t || busy || finished) return;
    setInput("");
    send(t);
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyanglow text-space shadow-[0_0_30px_rgba(0,229,255,0.5)] hover:scale-105 transition"
        aria-label="Open chat"
      >
        {open ? (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl glass shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/10 bg-space/60 px-4 py-3">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyanglow to-[#7C5CFF]">
              <span className="absolute inset-0 rounded-full bg-cyanglow blur opacity-50 animate-glow" />
              <svg viewBox="0 0 24 24" className="relative h-4 w-4 text-space" fill="currentColor">
                <path d="M12 2a7 7 0 00-7 7v3H4a1 1 0 00-1 1 9 9 0 0018 0 1 1 0 00-1-1h-1V9a7 7 0 00-7-7z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">Umbrella AI</p>
              <p className="text-[11px] text-cyanglow leading-tight">● online — replies instantly</p>
            </div>
          </div>

          <div ref={scrollRef} className="h-80 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-cyanglow text-space rounded-br-sm"
                      : "bg-white/8 text-white/90 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2.5">
                  <span className="flex gap-1">
                    <i className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <i className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <i className="h-1.5 w-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </span>
                </div>
              </div>
            )}

            {options && !busy && (
              <div className="flex flex-wrap gap-2 pt-1">
                {options.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => send(o)}
                    className="rounded-full border border-cyanglow/40 bg-cyanglow/10 px-3 py-1.5 text-xs text-cyanglow hover:bg-cyanglow/20 transition"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={submit} className="border-t border-white/10 bg-space/60 p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={busy || finished}
                placeholder={finished ? "Thanks for chatting!" : "Type your message…"}
                className="flex-1 rounded-full bg-white/8 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:ring-1 focus:ring-cyanglow/60 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={busy || finished || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-cyanglow text-space disabled:opacity-40"
                aria-label="Send"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l13-6-6 13-2-5-5-2z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
