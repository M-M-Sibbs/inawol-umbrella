"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { COMPANY, NAV } from "../lib/content";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-space/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative inline-flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-lg bg-cyanglow blur-md opacity-30 group-hover:opacity-60 transition" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/umbrella-icon.png" alt="Inawol Umbrella Technologies" className="relative h-9 w-9 object-contain" />
          </span>
          <span className="font-display font-bold tracking-tight text-[15px] leading-none">
            Inawol Umbrella<span className="text-cyanglow">.</span>
          </span>
        </Link>

        <ul className="hidden lg:flex items-center gap-7 text-sm text-white/70">
          {NAV.map((n, i) => (
            <li key={i}>
              <Link href={n.href} className="hover:text-white transition">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="/#contact"
            className="btn-glow rounded-full bg-cyanglow px-5 py-2 text-sm font-semibold text-space"
          >
            Book Strategy Call
          </a>
        </div>

        <button
          className="lg:hidden text-white"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-white/5 bg-space/95 backdrop-blur-xl px-5 py-4">
          <ul className="flex flex-col gap-3 text-white/80">
            {NAV.map((n, i) => (
              <li key={i}>
                <Link href={n.href} onClick={() => setOpen(false)} className="block py-1">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/#contact" onClick={() => setOpen(false)}
                className="mt-2 inline-block rounded-full bg-cyanglow px-5 py-2 text-sm font-semibold text-space">
                Book Strategy Call
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
