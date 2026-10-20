// Dynamic sitemap. Next.js serves this at /sitemap.xml automatically.
import { SEED_PROJECTS } from "@/lib/content";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://inawol.store";

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: "", priority: 1.0, changeFrequency: "weekly" },
    { url: "/projects", priority: 0.9, changeFrequency: "weekly" },
    { url: "/services/ai-agent-development", priority: 0.9, changeFrequency: "monthly" },
    { url: "/services/business-automation", priority: 0.9, changeFrequency: "monthly" },
    { url: "/services/website-development", priority: 0.9, changeFrequency: "monthly" },
    { url: "/services/mobile-app-development", priority: 0.9, changeFrequency: "monthly" },
    { url: "/services/ai-training", priority: 0.9, changeFrequency: "monthly" },
    { url: "/about", priority: 0.7, changeFrequency: "monthly" },
    { url: "/contact", priority: 0.8, changeFrequency: "monthly" },
  ].map((r) => ({
    url: `${BASE}${r.url}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Pull live projects; fall back to seed slugs.
  let projectSlugs = SEED_PROJECTS.map((p) => p.slug);
  try {
    const res = await fetch(`${BASE}/api/projects`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.projects) && data.projects.length) {
        projectSlugs = data.projects.map((p) => p.slug).filter(Boolean);
      }
    }
  } catch {
    // keep seed slugs
  }

  const projectRoutes = projectSlugs.map((slug) => ({
    url: `${BASE}/projects/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
