import { createFileRoute } from "@tanstack/react-router";
import { CmsResource, statusOptions } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/artikel")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "articles" as const,
  title: "Artikel Kesehatan",
  singular: "Artikel",
  select: "*, article_categories(name), team_members(name)",
  orderBy: { column: "created_at", ascending: false },
  searchField: "title",
  defaults: { status: "draft" },
  columns: [
    { key: "cover_image", label: "", render: (r: any) => r.cover_image ? <img src={r.cover_image} alt="" className="h-10 w-16 rounded object-cover" /> : <div className="h-10 w-16 rounded bg-primary-light" /> },
    { key: "title", label: "Judul" },
    { key: "article_categories", label: "Kategori", render: (r: any) => r.article_categories?.name ?? "—" },
    { key: "team_members", label: "Penulis", render: (r: any) => r.team_members?.name ?? "—" },
    { key: "published_at", label: "Publish", render: (r: any) => r.published_at ? new Date(r.published_at).toLocaleDateString("id-ID") : "—" },
    { key: "status", label: "Status" },
  ],
  fields: [
    { name: "title", label: "Judul", required: true, colSpan: 2 },
    { name: "slug", label: "Slug", type: "slug", from: "title", required: true },
    { name: "category_id", label: "Kategori", type: "select", optionsFrom: { table: "article_categories", labelField: "name" } },
    { name: "cover_image", label: "Gambar Cover", type: "image", colSpan: 2 },
    { name: "excerpt", label: "Ringkasan", type: "textarea", colSpan: 2 },
    { name: "content", label: "Konten", type: "richtext", rows: 14, colSpan: 2, help: "Tulis konten artikel. Pengeditan HTML kaya akan ditambahkan di versi lanjutan." },
    { name: "author_id", label: "Penulis", type: "select", optionsFrom: { table: "team_members", labelField: "name" } },
    { name: "published_at", label: "Tanggal Publish", type: "date" },
    { name: "read_time", label: "Waktu Baca (menit)", type: "number", min: 0 },
    { name: "status", label: "Status Publish", type: "select", options: statusOptions },
    { name: "meta_title", label: "SEO Meta Title", colSpan: 2 },
    { name: "meta_description", label: "SEO Meta Description", type: "textarea", colSpan: 2 },
  ],
};
