import { COMPANY, SERVICES } from "./content";

export const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://inawol.store";

// Central keyword map. Geo-targeted buyer-intent terms are where you can
// actually rank; broad global terms are included as secondary context only.
export const KEYWORDS = {
  global: [
    "AI agent development",
    "AI automation company",
    "software development company",
    "custom AI development",
    "AI chatbot development",
  ],
  geo: [
    "AI agent development Zimbabwe",
    "AI automation Zimbabwe",
    "website development Zimbabwe",
    "web development company Harare",
    "mobile app development Zimbabwe",
    "AI training Zimbabwe",
    "AI consulting Zimbabwe",
    "software development company Zimbabwe",
    "AI lessons Zimbabwe",
    "AI developers Southern Africa",
  ],
};

// Organization + LocalBusiness schema — the anchor for the whole site.
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${BASE}/#organization`,
    name: COMPANY.name,
    alternateName: COMPANY.short,
    url: BASE,
    logo: `${BASE}/logo.png`,
    image: `${BASE}/og.png`,
    description: COMPANY.positioning,
    email: COMPANY.email,
    telephone: COMPANY.whatsapp,
    areaServed: [
      { "@type": "Country", name: "Zimbabwe" },
      { "@type": "Place", name: "Southern Africa" },
      { "@type": "Place", name: "Worldwide" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Harare",
      addressCountry: "ZW",
    },
    knowsAbout: [
      "Artificial Intelligence",
      "AI Agents",
      "Business Automation",
      "Web Development",
      "Mobile App Development",
      "AI Education",
    ],
    sameAs: [
      // Fill these in with your real profiles — they strengthen entity trust.
      "https://www.linkedin.com/company/umbrella-technologies",
      "https://web.facebook.com/umbrellatech",
      "https://x.com/umbrellatech",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE}/#website`,
    url: BASE,
    name: COMPANY.short,
    publisher: { "@id": `${BASE}/#organization` },
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE}/projects?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// Service schema generator — one per service page.
export function serviceSchema(service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.title,
    provider: { "@id": `${BASE}/#organization` },
    areaServed: ["Zimbabwe", "Southern Africa", "Worldwide"],
    description: service.blurb,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.title} capabilities`,
      itemListElement: service.capabilities.map((c) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: c },
      })),
    },
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${BASE}${it.href}`,
    })),
  };
}

// FAQ schema — eligible for rich results and captures "how/what/cost" queries.
export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

// Helper to render a <script type="application/ld+json"> safely.
export function jsonLd(schema) {
  return {
    __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
  };
}

export { SERVICES };
