import { createFileRoute } from "@tanstack/react-router";
import { CmsResource } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/kategori-artikel")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "article_categories" as const,
  title: "Kategori Artikel",
  singular: "Kategori",
  orderBy: { column: "name", ascending: true },
  searchField: "name",
  columns: [
    { key: "name", label: "Nama" },
    { key: "slug", label: "Slug" },
  ],
  fields: [
    { name: "name", label: "Nama Kategori", required: true },
    { name: "slug", label: "Slug", type: "slug", from: "name", required: true },
    { name: "description", label: "Deskripsi", type: "textarea", colSpan: 2 },
  ],
};
