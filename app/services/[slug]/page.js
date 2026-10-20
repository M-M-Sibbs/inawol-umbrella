import Link from "next/link";
import { notFound } from "next/navigation";

// Self-contained service landing pages. No external component/lib imports, so
// this builds regardless of the rest of the project's structure. SEO metadata
// and JSON-LD are generated inline.

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://inawol.store";
const COMPANY = "Inawol Umbrella Technologies";

const SERVICES = [
  {
    slug: "ai-agent-development",
    title: "AI Agent Development",
    seoTitle: "AI Agent Development in Zimbabwe",
    seoDescription:
      "Custom AI agents for support, sales, WhatsApp and operations — built to run 24/7. AI agent development for businesses in Zimbabwe, Southern Africa and worldwide.",
    cta: "Build My Agent",
    capabilities: [
      "Customer support agents",
      "WhatsApp agents",
      "Sales agents",
      "HR agents",
      "Lead generation agents",
      "Knowledge assistants",
      "Voice agents",
    ],
  },
  {
    slug: "business-automation",
    title: "Business Automation",
    seoTitle: "Business Automation Services",
    seoDescription:
      "Automate CRM, invoicing, email and workflows. Business process automation that cuts manual work and never misses a follow-up.",
    cta: "Automate My Business",
    capabilities: [
      "CRM automation",
      "Workflow automation",
      "Document automation",
      "Invoice automation",
      "Email automation",
      "Lead nurturing automation",
    ],
  },
  {
    slug: "website-development",
    title: "Website Development",
    seoTitle: "Website Development in Zimbabwe",
    seoDescription:
      "Fast, SEO-ready corporate websites, e-commerce, LMS and web apps. Professional website development company serving Harare, Zimbabwe and beyond.",
    cta: "Build My Website",
    capabilities: [
      "Corporate websites",
      "E-commerce websites",
      "LMS systems",
      "Booking platforms",
      "Custom web applications",
    ],
  },
  {
    slug: "mobile-app-development",
    title: "Mobile App Development",
    seoTitle: "Mobile App Development in Zimbabwe",
    seoDescription:
      "Android, iOS and Flutter apps built to scale. Mobile app development for startups and enterprises across Zimbabwe and Southern Africa.",
    cta: "Build My App",
    capabilities: [
      "Android apps",
      "iOS apps",
      "Flutter apps",
      "Cross-platform applications",
      "Enterprise mobility solutions",
    ],
  },
  {
    slug: "ai-training",
    title: "AI Training & Lessons",
    seoTitle: "AI Training & Lessons",
    seoDescription:
      "Corporate AI training, workshops, school curriculum and certification. Learn AI with hands-on lessons for teams, schools and individuals.",
    cta: "Train My Team",
    capabilities: [
      "Corporate AI training",
      "School AI curriculum",
      "AI workshops",
      "AI certification programs",
      "AI literacy programs",
    ],
  },
];

const FAQS = [
  {
    q: "What does Inawol Umbrella Technologies do?",
    a: "We build AI agents, business automations, websites, mobile apps, and run AI training programs for businesses in Zimbabwe, Southern Africa and worldwide.",
  },
  {
    q: "How much does AI agent development cost in Zimbabwe?",
    a: "Projects are scoped to your needs. Most AI agent and automation projects start small and scale; book a free strategy call for a tailored quote.",
  },
  {
    q: "Do you work with clients outside Zimbabwe?",
    a: "Yes. We deliver AI development, web and mobile projects remotely for clients across Southern Africa and internationally.",
  },
  {
    q: "Can you train my team to use AI?",
    a: "Yes. We run corporate AI training, workshops, school AI curriculum and certification programs, in person and online.",
  },
];

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
    title: `${s.seoTitle} | Umbrella Technologies`,
    description: s.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${s.seoTitle} | Umbrella Technologies`,
      description: s.seoDescription,
      url,
      type: "website",
    },
  };
}

export default function ServicePage({ params }) {
  const s = getService(params.slug);
  if (!s) notFound();

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: s.title,
    provider: { "@type": "Organization", name: COMPANY, url: BASE },
    areaServed: ["Zimbabwe", "Southern Africa", "Worldwide"],
    description: s.seoDescription,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${s.title} capabilities`,
      itemListElement: s.capabilities.map((c) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: c },
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: s.title, item: `${BASE}/services/${s.slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const ld = (o) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });

  return (
    <main style={{ minHeight: "100vh", background: "#0B1020", color: "#fff" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(serviceSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(breadcrumbSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqSchema)} />

      <section className="mx-auto max-w-4xl px-5 pt-28 pb-20 sm:px-8">
        <nav className="mb-6 text-sm text-white/40">
          <Link href="/" className="hover:text-[#00E5FF]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white/70">{s.title}</span>
        </nav>

        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          {s.seoTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-white/65">{s.seoDescription}</p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 font-medium"
            style={{ background: "#00E5FF", color: "#0B1020" }}
          >
            {s.cta}
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 font-medium text-white/90"
          >
            See related projects
          </Link>
        </div>

        <h2 className="mt-16 text-2xl font-bold">What's included</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {s.capabilities.map((c) => (
            <div
              key={c}
              className="flex items-center gap-3 rounded-2xl border border-white/10 p-5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                style={{ background: "rgba(0,229,255,0.15)", color: "#00E5FF" }}
              >
                ✓
              </span>
              <span className="text-white/85">{c}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-6 space-y-4">
          {FAQS.map((f, i) => (
            <details
              key={i}
              className="rounded-2xl border border-white/10 p-5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <summary className="cursor-pointer list-none font-medium text-white/90">
                {f.q}
              </summary>
              <p className="mt-3 text-sm text-white/60">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-sm text-white/40">
          <Link href="/" className="hover:text-[#00E5FF]">← Back to {COMPANY}</Link>
        </div>
      </section>
    </main>
  );
}
