import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, FileText, Megaphone, Inbox, Star, Users } from "lucide-react";
import { cmsCount } from "@/lib/cms.functions";
import { cmsList } from "@/lib/cms.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => ({
      products: await cmsCount({ data: { table: "products", filter: { status: "published" } } }),
      articles: await cmsCount({ data: { table: "articles", filter: { status: "published" } } }),
      promos: await cmsCount({ data: { table: "promotions", filter: { status: "published" } } }),
      unreadMessages: await cmsCount({ data: { table: "contact_messages", filter: { status: "new" } } }),
      testimonials: await cmsCount({ data: { table: "testimonials", filter: undefined } }),
      team: await cmsCount({ data: { table: "team_members", filter: undefined } }),
    }),
  });

  const recent = useQuery({
    queryKey: ["admin-recent-messages"],
    queryFn: async () => {
      const rows = await cmsList({ data: { config: { table: "contact_messages", orderBy: { column: "created_at", ascending: false } } } });
      return (rows as any[]).slice(0, 5);
    },
  });

  const cards = [
    { key: "products", label: "Produk Published", icon: Package, to: "/admin/produk" },
    { key: "articles", label: "Artikel Published", icon: FileText, to: "/admin/artikel" },
    { key: "promos", label: "Promo Aktif", icon: Megaphone, to: "/admin/promo" },
    { key: "unreadMessages", label: "Pesan Belum Dibaca", icon: Inbox, to: "/admin/pesan" },
    { key: "testimonials", label: "Total Testimoni", icon: Star, to: "/admin/testimoni" },
    { key: "team", label: "Tim Apoteker", icon: Users, to: "/admin/tim" },
  ] as const;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-primary-dark">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">Ringkasan aktivitas CMS apotek Anda.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.key} to={c.to} className="rounded-2xl bg-card p-5 border border-border/60 shadow-soft hover:shadow-elegant transition">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary-light text-primary p-3"><c.icon className="h-5 w-5" /></div>
              <div>
                <div className="text-3xl font-display font-bold text-primary-dark">{stats.isLoading ? "…" : (stats.data as any)?.[c.key] ?? 0}</div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-card p-5 border border-border/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-primary-dark">Pesan Terbaru</h2>
          <Link to="/admin/pesan" className="text-xs text-primary hover:underline">Lihat semua →</Link>
        </div>
        <div className="divide-y divide-border/60">
          {(recent.data ?? []).length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Belum ada pesan masuk.</div>
          ) : (recent.data ?? []).map((m) => (
            <div key={m.id} className="py-3">
              <div className="flex justify-between text-sm">
                <div><span className="font-semibold">{m.name}</span> <span className="text-muted-foreground">· {m.contact_info}</span></div>
                <div className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString("id-ID")}</div>
              </div>
              {m.subject ? <div className="text-sm text-primary-dark mt-1">{m.subject}</div> : null}
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
