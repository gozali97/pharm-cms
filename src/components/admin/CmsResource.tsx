import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { cmsList, cmsInsert, cmsUpdate, cmsDelete } from "@/lib/cms.functions";
import { Drawer, ResourceField } from "./FormControls";

export type ResourceConfig = {
  table: string;
  title: string;
  singular: string;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[];
  fields: any[];
  defaults?: Record<string, any>;
  searchField?: string;
};

export function CmsResource({ config }: { config: any }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const key = ["admin", config.table, search];
  const list = useQuery({
    queryKey: key,
    queryFn: async () => cmsList({ data: { config: { table: config.table, orderBy: config.orderBy, searchField: config.searchField }, search } }),
  });

  const upsert = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      if (editing?.id) {
        await cmsUpdate({ data: { table: config.table, id: editing.id, payload } });
      } else {
        await cmsInsert({ data: { table: config.table, payload } });
      }
    },
    onSuccess: () => {
      toast.success("Tersimpan");
      setDrawerOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", config.table] });
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menyimpan"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await cmsDelete({ data: { table: config.table, id } });
    },
    onSuccess: () => {
      toast.success("Dihapus");
      qc.invalidateQueries({ queryKey: ["admin", config.table] });
    },
    onError: (e: any) => toast.error(e.message ?? "Gagal menghapus"),
  });

  function openCreate() {
    setEditing(null);
    setForm({ ...(config.defaults ?? {}) });
    setDrawerOpen(true);
  }
  function openEdit(row: any) {
    setEditing(row);
    setForm({ ...row });
    setDrawerOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, any> = {};
    for (const f of config.fields as any[]) {
      let v = form[f.name];
      if (v === "") v = null;
      if (f.required && (v === null || v === undefined)) {
        toast.error(`${f.label} wajib diisi`);
        return;
      }
      payload[f.name] = v;
    }
    upsert.mutate(payload);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <h1 className="font-display text-2xl font-bold text-primary-dark flex-1">{config.title}</h1>
        {config.searchField ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari..." className="w-56 rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm" />
          </div>
        ) : null}
        <button onClick={openCreate} className="inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>

      <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {config.columns.map((c: any) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}
                <th className="px-4 py-3 w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.isLoading ? (
                <tr><td colSpan={config.columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">Memuat...</td></tr>
              ) : (list.data ?? []).length === 0 ? (
                <tr><td colSpan={config.columns.length + 1} className="px-4 py-8 text-center text-muted-foreground">Belum ada data.</td></tr>
              ) : (list.data ?? []).map((row: any) => (
                <tr key={row.id} className="border-t border-border/60 hover:bg-muted/30">
                  {config.columns.map((c: any) => (
                    <td key={c.key} className="px-4 py-3">{c.render ? c.render(row) : (row[c.key] ?? "—")}</td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => openEdit(row)} className="p-1.5 rounded-md hover:bg-muted text-primary" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button
                        onClick={() => { if (confirm(`Hapus "${row.name ?? row.title ?? row.question ?? row.customer_name ?? "item ini"}"?`)) del.mutate(row.id); }}
                        className="p-1.5 rounded-md hover:bg-muted text-destructive"
                        title="Hapus"
                      ><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? `Edit ${config.singular}` : `Tambah ${config.singular}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((f: any) => (
              <ResourceField key={f.name} field={f} value={form[f.name]} setValue={(v) => setForm((p) => ({ ...p, [f.name]: v }))} allValues={form} />
            ))}
          </div>
          <div className="flex gap-2 pt-4 border-t border-border">
            <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-muted">Batal</button>
            <button disabled={upsert.isPending} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-60 hover:opacity-90">
              {upsert.isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}

export const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];
