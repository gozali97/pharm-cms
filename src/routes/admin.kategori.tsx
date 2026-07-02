import { createFileRoute } from "@tanstack/react-router";
import { CmsResource } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/kategori")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "product_categories" as const,
  title: "Kategori Produk",
  singular: "Kategori",
  orderBy: { column: "display_order", ascending: true },
  searchField: "name",
  defaults: { display_order: 0 },
  columns: [
    { key: "icon_image", label: "", render: (r: any) => r.icon_image ? <img src={r.icon_image} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-primary-light" /> },
    { key: "name", label: "Nama" },
    { key: "slug", label: "Slug" },
    { key: "display_order", label: "Urutan" },
  ],
  fields: [
    { name: "name", label: "Nama Kategori", required: true },
    { name: "slug", label: "Slug", type: "slug", from: "name", required: true },
    { name: "description", label: "Deskripsi", type: "textarea", colSpan: 2 },
    { name: "icon_image", label: "Ikon / Gambar", type: "image" },
    { name: "display_order", label: "Urutan Tampil", type: "number", min: 0 },
  ],
};
