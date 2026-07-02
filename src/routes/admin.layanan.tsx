import { createFileRoute } from "@tanstack/react-router";
import { CmsResource, statusOptions } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/layanan")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "services" as const,
  title: "Layanan",
  singular: "Layanan",
  orderBy: { column: "created_at", ascending: false },
  searchField: "name",
  defaults: { status: "draft", is_featured: false },
  columns: [
    { key: "icon_image", label: "", render: (r: any) => r.icon_image ? <img src={r.icon_image} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-primary-light" /> },
    { key: "name", label: "Nama" },
    { key: "price", label: "Harga", render: (r: any) => r.price ? `Rp ${Number(r.price).toLocaleString("id-ID")}` : "—" },
    { key: "is_featured", label: "Unggulan", render: (r: any) => r.is_featured ? "★" : "—" },
    { key: "status", label: "Status" },
  ],
  fields: [
    { name: "name", label: "Nama Layanan", required: true },
    { name: "slug", label: "Slug", type: "slug", from: "name", required: true },
    { name: "icon_image", label: "Ikon / Gambar", type: "image" },
    { name: "short_description", label: "Deskripsi Singkat", type: "textarea", colSpan: 2 },
    { name: "description", label: "Deskripsi Lengkap", type: "richtext", colSpan: 2 },
    { name: "price", label: "Harga (Rp)", type: "number", min: 0 },
    { name: "duration", label: "Durasi Estimasi", placeholder: "30 menit" },
    { name: "is_featured", label: "Tampilkan sebagai unggulan", type: "boolean" },
    { name: "status", label: "Status Publish", type: "select", options: statusOptions },
  ],
};
