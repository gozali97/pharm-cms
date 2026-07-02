import { createFileRoute } from "@tanstack/react-router";
import { CmsResource } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/testimoni")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "testimonials" as const,
  title: "Testimoni",
  singular: "Testimoni",
  orderBy: { column: "created_at", ascending: false },
  searchField: "customer_name",
  defaults: { status: "pending", rating: 5 },
  columns: [
    { key: "photo", label: "", render: (r: any) => r.photo ? <img src={r.photo} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-primary-light" /> },
    { key: "customer_name", label: "Nama" },
    { key: "rating", label: "Rating", render: (r: any) => "★".repeat(r.rating) + "☆".repeat(5 - r.rating) },
    { key: "content", label: "Isi", render: (r: any) => <span className="line-clamp-1 max-w-xs inline-block">{r.content}</span> },
    { key: "status", label: "Status" },
  ],
  fields: [
    { name: "customer_name", label: "Nama Pelanggan", required: true },
    { name: "rating", label: "Rating (1-5)", type: "number", min: 1, max: 5 },
    { name: "photo", label: "Foto (opsional)", type: "image" },
    { name: "content", label: "Isi Testimoni", type: "textarea", rows: 4, required: true, colSpan: 2 },
    { name: "testimonial_date", label: "Tanggal", type: "date" },
    { name: "status", label: "Status", type: "select", options: [{ value: "pending", label: "Menunggu" }, { value: "approved", label: "Tampilkan" }, { value: "hidden", label: "Sembunyikan" }] },
  ],
};
