import { createFileRoute } from "@tanstack/react-router";
import { CmsResource, statusOptions } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/promo")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "promotions" as const,
  title: "Promo / Banner",
  singular: "Promo",
  orderBy: { column: "created_at", ascending: false },
  searchField: "title",
  defaults: { status: "draft" },
  columns: [
    { key: "banner_image", label: "", render: (r: any) => r.banner_image ? <img src={r.banner_image} alt="" className="h-10 w-16 rounded object-cover" /> : <div className="h-10 w-16 rounded bg-primary-light" /> },
    { key: "title", label: "Judul" },
    { key: "promo_code", label: "Kode" },
    { key: "start_date", label: "Mulai", render: (r: any) => r.start_date ? new Date(r.start_date).toLocaleDateString("id-ID") : "—" },
    { key: "end_date", label: "Berakhir", render: (r: any) => r.end_date ? new Date(r.end_date).toLocaleDateString("id-ID") : "—" },
    { key: "status", label: "Status" },
  ],
  fields: [
    { name: "title", label: "Judul Promo", required: true, colSpan: 2 },
    { name: "banner_image", label: "Banner Promo", type: "image", colSpan: 2 },
    { name: "description", label: "Deskripsi", type: "textarea", colSpan: 2 },
    { name: "promo_code", label: "Kode Promo (opsional)" },
    { name: "cta_link", label: "Link CTA (opsional)" },
    { name: "start_date", label: "Tanggal Mulai", type: "date" },
    { name: "end_date", label: "Tanggal Berakhir", type: "date" },
    { name: "status", label: "Status Publish", type: "select", options: statusOptions },
  ],
};
