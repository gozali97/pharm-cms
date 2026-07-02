import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listProducts, listArticles } from "@/lib/server/repo.server";

const BASE_URL = "http://localhost:8080";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  image?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", image: `${BASE_URL}/images/hero-pharmacy.jpg` },
          { path: "/produk", changefreq: "daily", priority: "0.9" },
          { path: "/layanan", changefreq: "weekly", priority: "0.8" },
          { path: "/promo", changefreq: "daily", priority: "0.8" },
          { path: "/artikel", changefreq: "daily", priority: "0.8" },
          { path: "/cabang", changefreq: "monthly", priority: "0.7" },
          { path: "/tentang", changefreq: "monthly", priority: "0.6" },
          { path: "/faq", changefreq: "monthly", priority: "0.5" },
          { path: "/kontak", changefreq: "monthly", priority: "0.6" },
        ];

        try {
          const products = listProducts();
          const articles = listArticles();
          for (const p of products ?? []) {
            entries.push({
              path: `/produk/${p.slug}`,
              lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : undefined,
              changefreq: "weekly",
              priority: "0.7",
              image: p.main_image ?? undefined,
            });
          }
          for (const a of articles ?? []) {
            entries.push({
              path: `/artikel/${a.slug}`,
              lastmod: a.updated_at ? new Date(a.updated_at).toISOString() : undefined,
              changefreq: "monthly",
              priority: "0.6",
              image: a.cover_image ?? undefined,
            });
          }
        } catch {
          // fall back to static entries
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            e.image ? `    <image:image><image:loc>${e.image}</image:loc></image:image>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
