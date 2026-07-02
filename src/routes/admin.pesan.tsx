import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Mail, CheckCircle2 } from "lucide-react";
import { cmsList } from "@/lib/cms.functions";
import { createContactMessageFn } from "@/lib/contact.functions";

export const Route = createFileRoute("/admin/pesan")({ component: Pesan });

function Pesan() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contact_messages"],
    queryFn: async () => cmsList({ data: { config: { table: "contact_messages", orderBy: { column: "created_at", ascending: false } } } }),
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateContactMessageStatusFn({ data: { id, status } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "contact_messages"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await deleteContactMessageFn({ data: { id } });
    },
    onSuccess: () => {
      toast.success("Pesan dihapus");
      qc.invalidateQueries({ queryKey: ["admin", "contact_messages"] });
    },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-dark mb-5">Pesan Masuk</h1>
      <div className="space-y-3">
        {isLoading ? <div className="text-muted-foreground">Memuat...</div> : (data ?? []).length === 0 ? (
          <div className="rounded-2xl bg-card p-8 border border-border text-center text-muted-foreground">Belum ada pesan.</div>
        ) : (data ?? []).map((m) => (
          <div key={m.id} className={`rounded-2xl bg-card p-5 border ${m.status === "new" ? "border-primary" : "border-border/60"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{m.name} <span className="ml-2 text-xs rounded-full px-2 py-0.5 bg-muted text-muted-foreground">{m.status}</span></div>
                <div className="text-sm text-muted-foreground">{m.contact_info}</div>
                {m.subject ? <div className="mt-1 font-medium text-primary-dark">{m.subject}</div> : null}
              </div>
              <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("id-ID")}</div>
            </div>
            <div className="mt-3 text-sm whitespace-pre-wrap">{m.message}</div>
            <div className="mt-4 flex gap-2">
              {m.status !== "read" ? (
                <button onClick={() => update.mutate({ id: m.id, status: "read" })} className="inline-flex items-center gap-1 text-xs rounded-md border border-input px-3 py-1.5 hover:bg-muted">
                  <Mail className="h-3.5 w-3.5" /> Tandai dibaca
                </button>
              ) : null}
              {m.status !== "handled" ? (
                <button onClick={() => update.mutate({ id: m.id, status: "handled" })} className="inline-flex items-center gap-1 text-xs rounded-md border border-input px-3 py-1.5 hover:bg-muted">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Tandai selesai
                </button>
              ) : null}
              <button onClick={() => { if (confirm("Hapus pesan ini?")) remove.mutate(m.id); }} className="inline-flex items-center gap-1 text-xs rounded-md border border-input px-3 py-1.5 hover:bg-muted text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
