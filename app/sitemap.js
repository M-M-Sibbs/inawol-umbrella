// Dynamic sitemap, served at /sitemap.xml. Self-contained — no imports that
// could fail the build if other files change.

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://inawol.store";

export default function sitemap() {
  const now = new Date();
  const routes = [
    { url: "", priority: 1.0, changeFrequency: "weekly" },
    { url: "/projects", priority: 0.9, changeFrequency: "weekly" },
    { url: "/services/ai-agent-development", priority: 0.9, changeFrequency: "monthly" },
    { url: "/services/business-automation", priority: 0.9, changeFrequency: "monthly" },
    { url: "/services/website-development", priority: 0.9, changeFrequency: "monthly" },
    { url: "/services/mobile-app-development", priority: 0.9, changeFrequency: "monthly" },
    { url: "/services/ai-training", priority: 0.9, changeFrequency: "monthly" },
    { url: "/tutoring", priority: 0.8, changeFrequency: "weekly" },
  ];
  return routes.map((r) => ({
    url: `${BASE}${r.url}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
