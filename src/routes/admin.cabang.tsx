import { createFileRoute } from "@tanstack/react-router";
import { CmsResource } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/cabang")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "branches" as const,
  title: "Cabang / Lokasi",
  singular: "Cabang",
  orderBy: { column: "display_order", ascending: true },
  searchField: "name",
  defaults: { is_published: true, status: "buka", display_order: 0 },
  columns: [
    { key: "photo", label: "", render: (r: any) => r.photo ? <img src={r.photo} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-primary-light" /> },
    { key: "name", label: "Nama Cabang" },
    { key: "phone", label: "Telepon" },
    { key: "status", label: "Status" },
    { key: "is_published", label: "Publish", render: (r: any) => r.is_published ? "✓" : "—" },
  ],
  fields: [
    { name: "name", label: "Nama Cabang", required: true },
    { name: "phone", label: "Nomor Telepon" },
    { name: "whatsapp", label: "Nomor WhatsApp" },
    { name: "address", label: "Alamat Lengkap", type: "textarea", colSpan: 2 },
    { name: "latitude", label: "Latitude", type: "number", step: 0.000001 },
    { name: "longitude", label: "Longitude", type: "number", step: 0.000001 },
    { name: "map_embed", label: "Google Maps Embed URL", colSpan: 2 },
    { name: "operating_hours", label: "Jam Operasional (JSON)", type: "textarea", colSpan: 2, help: 'Contoh: {"senin_jumat":"08:00-21:00","sabtu":"08:00-20:00","minggu":"09:00-18:00"}' },
    { name: "photo", label: "Foto Cabang", type: "image", colSpan: 2 },
    { name: "status", label: "Status", type: "select", options: [{ value: "buka", label: "Buka" }, { value: "tutup", label: "Tutup" }] },
    { name: "display_order", label: "Urutan", type: "number", min: 0 },
    { name: "is_published", label: "Tampilkan di publik", type: "boolean" },
  ],
};
