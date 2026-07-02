import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Copy } from "lucide-react";
import { uploadMedia, listMedia, deleteMedia } from "@/lib/media";

export const Route = createFileRoute("/admin/media")({ component: MediaLib });

function MediaLib() {
  const qc = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const { data } = useQuery({ queryKey: ["admin-media"], queryFn: listMedia });

  const remove = useMutation({
    mutationFn: async ({ id }: { id: string }) => deleteMedia(id),
    onSuccess: () => {
      toast.success("Dihapus");
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    },
  });

  async function onFiles(files: FileList) {
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) continue;
        await uploadMedia(f);
      }
      toast.success("Upload selesai");
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    } catch (e) {
      toast.error("Gagal: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const filtered = (data ?? []).filter((m) => !search || m.file_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <h1 className="font-display text-2xl font-bold text-primary-dark flex-1">Media Library</h1>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama file..." className="rounded-lg border border-input bg-background px-3 py-2 text-sm w-56" />
        <button onClick={() => ref.current?.click()} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-60">
          <Upload className="h-4 w-4" /> {busy ? "Mengunggah..." : "Unggah"}
        </button>
        <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = ""; }} />
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((m) => (
          <div key={m.id} className="group rounded-lg overflow-hidden bg-card border border-border/60 shadow-soft">
            <div className="aspect-square bg-muted">
              <img src={m.file_url} alt={m.alt_text ?? m.file_name} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="p-2">
              <div className="text-xs truncate" title={m.file_name}>{m.file_name}</div>
              <div className="mt-1 flex gap-1">
                <button onClick={() => { navigator.clipboard.writeText(m.file_url); toast.success("URL disalin"); }} className="p-1.5 rounded hover:bg-muted text-primary" title="Salin URL"><Copy className="h-3.5 w-3.5" /></button>
                <button onClick={() => { if (confirm("Hapus gambar ini?")) remove.mutate({ id: m.id }); }} className="p-1.5 rounded hover:bg-muted text-destructive" title="Hapus"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 ? <div className="col-span-full text-center py-16 text-muted-foreground">Belum ada media.</div> : null}
      </div>
    </div>
  );
}
