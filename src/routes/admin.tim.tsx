import { createFileRoute } from "@tanstack/react-router";
import { CmsResource } from "@/components/admin/CmsResource";

export const Route = createFileRoute("/admin/tim")({ component: () => <CmsResource config={config} /> });

const config = {
  table: "team_members" as const,
  title: "Tim / Apoteker",
  singular: "Anggota Tim",
  select: "*, branches(name)",
  orderBy: { column: "display_order", ascending: true },
  searchField: "name",
  defaults: { is_published: true, display_order: 0 },
  columns: [
    { key: "photo", label: "", render: (r: any) => r.photo ? <img src={r.photo} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="h-10 w-10 rounded-full bg-primary-light" /> },
    { key: "name", label: "Nama" },
    { key: "position", label: "Jabatan" },
    { key: "branches", label: "Cabang", render: (r: any) => r.branches?.name ?? "—" },
    { key: "is_published", label: "Tampil", render: (r: any) => r.is_published ? "✓" : "—" },
  ],
  fields: [
    { name: "name", label: "Nama Lengkap", required: true },
    { name: "position", label: "Jabatan", placeholder: "Apoteker Penanggung Jawab" },
    { name: "license_number", label: "Nomor STRA / SIPA" },
    { name: "branch_id", label: "Cabang Penempatan", type: "select", optionsFrom: { table: "branches", labelField: "name" } },
    { name: "photo", label: "Foto Profil", type: "image", colSpan: 2 },
    { name: "bio", label: "Bio Singkat", type: "textarea", colSpan: 2 },
    { name: "display_order", label: "Urutan", type: "number", min: 0 },
    { name: "is_published", label: "Tampilkan di publik", type: "boolean" },
  ],
};
