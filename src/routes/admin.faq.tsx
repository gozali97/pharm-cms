import { createFileRoute } from "@tanstack/react-router";
import { CmsResource } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/faq")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "faqs" as const,
  title: "FAQ",
  singular: "Pertanyaan",
  orderBy: { column: "display_order", ascending: true },
  searchField: "question",
  defaults: { is_published: true, display_order: 0 },
  columns: [
    { key: "question", label: "Pertanyaan" },
    { key: "category", label: "Kategori" },
    { key: "display_order", label: "Urutan" },
    { key: "is_published", label: "Tampil", render: (r: any) => r.is_published ? "✓" : "—" },
  ],
  fields: [
    { name: "question", label: "Pertanyaan", required: true, colSpan: 2 },
    { name: "answer", label: "Jawaban", type: "textarea", rows: 5, required: true, colSpan: 2 },
    { name: "category", label: "Kategori (opsional)" },
    { name: "display_order", label: "Urutan", type: "number", min: 0 },
    { name: "is_published", label: "Tampilkan di publik", type: "boolean" },
  ],
};
