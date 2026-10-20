import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import { SERVICES, FAQS, COMPANY } from "@/lib/content";
import {
  BASE,
  serviceSchema,
  breadcrumbSchema,
  faqSchema,
} from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

function getService(slug) {
  return SERVICES.find((s) => s.slug === slug);
}

export function generateMetadata({ params }) {
  const s = getService(params.slug);
  if (!s) return {};
  const url = `${BASE}/services/${s.slug}`;
  return {
    title: `${s.seoTitle} | ${COMPANY.short}`,
    description: s.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${s.seoTitle} | ${COMPANY.short}`,
      description: s.seoDescription,
      url,
      type: "website",
    },
  };
}

export default function ServicePage({ params }) {
  const s = getService(params.slug);
  if (!s) notFound();

  const crumbs = [
    { name: "Home", href: "/" },
    { name: s.title, href: `/services/${s.slug}` },
  ];

  return (
    <main>
      <JsonLd schema={serviceSchema(s)} />
      <JsonLd schema={breadcrumbSchema(crumbs)} />
      <JsonLd schema={faqSchema(FAQS)} />
      <Navbar />

      <section className="px-5 pt-36 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <nav className="mb-6 text-sm text-white/40">
            <Link href="/" className="hover:text-glow">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white/70">{s.title}</span>
          </nav>

          <Reveal>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              {s.seoTitle}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-lg text-white/65">{s.seoDescription}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary">{s.cta}</Link>
              <Link href="/projects" className="btn-ghost">See related projects</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="font-display text-2xl font-bold">What's included</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {s.capabilities.map((c, i) => (
              <Reveal key={c} delay={i * 0.04}>
                <div className="glass flex items-center gap-3 rounded-2xl p-5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-glow/15 text-glow">✓</span>
                  <span className="text-white/85">{c}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — indexable, matches question-style searches */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="font-display text-2xl font-bold">Frequently asked questions</h2>
          </Reveal>
          <div className="mt-8 space-y-4">
            {FAQS.map((f, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <details className="group glass rounded-2xl p-5">
                  <summary className="cursor-pointer list-none font-medium text-white/90">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-sm text-white/60">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </main>
  );
}
