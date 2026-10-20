// Served at /robots.txt automatically.
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://inawol.store";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
