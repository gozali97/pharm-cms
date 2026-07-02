import { createFileRoute } from "@tanstack/react-router";
import { CmsResource, statusOptions } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/produk")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "products" as const,
  title: "Produk / Obat",
  singular: "Produk",
  select: "*, product_categories(name)",
  orderBy: { column: "created_at", ascending: false },
  searchField: "name",
  defaults: { status: "draft", stock_status: "tersedia", show_price: true, requires_prescription: false, is_featured: false },
  columns: [
    { key: "main_image", label: "", render: (r: any) => r.main_image ? <img src={r.main_image} alt="" className="h-10 w-10 rounded object-cover" /> : <div className="h-10 w-10 rounded bg-muted" /> },
    { key: "name", label: "Nama" },
    { key: "product_categories", label: "Kategori", render: (r: any) => r.product_categories?.name ?? "—" },
    { key: "price", label: "Harga", render: (r: any) => r.price ? `Rp ${Number(r.price).toLocaleString("id-ID")}` : "—" },
    { key: "stock_status", label: "Stok", render: (r: any) => <span className="rounded-full bg-primary-light text-primary-dark px-2 py-0.5 text-xs">{r.stock_status}</span> },
    { key: "status", label: "Status", render: (r: any) => <span className={`rounded-full px-2 py-0.5 text-xs ${r.status === "published" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{r.status}</span> },
  ],
  fields: [
    { name: "name", label: "Nama Produk", required: true },
    { name: "slug", label: "Slug", type: "slug", from: "name", required: true },
    { name: "category_id", label: "Kategori", type: "select", optionsFrom: { table: "product_categories", labelField: "name" } },
    { name: "main_image", label: "Gambar Utama", type: "image", colSpan: 2 },
    { name: "short_description", label: "Deskripsi Singkat", type: "textarea", colSpan: 2 },
    { name: "description", label: "Deskripsi Lengkap", type: "richtext", colSpan: 2 },
    { name: "price", label: "Harga (Rp)", type: "number", min: 0 },
    { name: "unit", label: "Satuan", placeholder: "strip, botol, box..." },
    { name: "composition", label: "Kandungan / Komposisi", type: "textarea", colSpan: 2 },
    { name: "indication", label: "Indikasi", type: "textarea", colSpan: 2 },
    { name: "dosage", label: "Dosis / Aturan Pakai", type: "textarea", colSpan: 2 },
    { name: "stock_status", label: "Status Ketersediaan", type: "select", options: [{ value: "tersedia", label: "Tersedia" }, { value: "habis", label: "Habis" }, { value: "pre-order", label: "Pre-Order" }] },
    { name: "status", label: "Status Publish", type: "select", options: statusOptions },
    { name: "show_price", label: "Tampilkan harga di publik", type: "boolean" },
    { name: "requires_prescription", label: "Butuh resep dokter", type: "boolean" },
    { name: "is_featured", label: "Tampilkan sebagai unggulan", type: "boolean" },
    { name: "meta_title", label: "SEO Meta Title", colSpan: 2 },
    { name: "meta_description", label: "SEO Meta Description", type: "textarea", colSpan: 2 },
  ],
};
