// SEO helpers — self-contained, no imports from content.js so a change there
// can never break the build.

export const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://inawol.store";

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

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${BASE}/#organization`,
    name: "Inawol Umbrella Technologies",
    alternateName: "Umbrella Technologies",
    url: BASE,
    logo: `${BASE}/logo.png`,
    image: `${BASE}/og.png`,
    description:
      "Umbrella Technologies builds AI agents, intelligent automations and digital products that help organizations operate faster, smarter and more profitably.",
    email: "hello@inawol.store",
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
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE}/#website`,
    url: BASE,
    name: "Umbrella Technologies",
    inLanguage: "en",
  };
}

export function jsonLd(schema) {
  return { __html: JSON.stringify(schema).replace(/</g, "\\u003c") };
}
