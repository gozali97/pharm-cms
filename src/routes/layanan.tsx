import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchServices } from "@/lib/queries";

export const Route = createFileRoute("/layanan")({
  component: LayananPage,
  head: () => ({ meta: [{ title: "Layanan — Apotek Sehat" }, { name: "description", content: "Layanan lengkap Apotek Sehat: konsultasi apoteker, cek kesehatan, vaksinasi." }] }),
});

function LayananPage() {
  const { data, isLoading } = useQuery({ queryKey: ["services-all"], queryFn: fetchServices });
  return (
    <PublicLayout>
      <section className="gradient-hero border-b border-border/50">
        <div className="container-page py-12">
          <h1 className="font-display text-4xl font-bold text-primary-dark">Layanan Kami</h1>
          <p className="mt-2 text-muted-foreground">Lebih dari sekadar apotek — kami mitra kesehatan Anda.</p>
        </div>
      </section>
      <div className="container-page py-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 min-h-[600px]">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card p-6 shadow-soft border border-border/60 h-[220px] animate-pulse" />
            ))
          : (data ?? []).map((s) => (
          <div key={s.id} className="rounded-2xl bg-card p-6 shadow-soft border border-border/60">
            {s.icon_image ? (
              <img src={s.icon_image} alt={s.name} width={64} height={64} className="h-16 w-16 rounded-xl object-cover mb-4" loading="lazy" decoding="async" />
            ) : (
              <div className="h-16 w-16 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center mb-4 font-display font-bold text-2xl">{s.name.charAt(0)}</div>
            )}
            <h2 className="font-semibold text-lg">{s.name}</h2>
            {s.short_description ? <p className="mt-2 text-sm text-muted-foreground">{s.short_description}</p> : null}
            <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
              {s.duration ? <span>⏱ {s.duration}</span> : null}
              {s.price ? <span className="font-semibold text-primary">Rp {Number(s.price).toLocaleString("id-ID")}</span> : null}
            </div>
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 ? <div className="col-span-full text-center py-16 text-muted-foreground">Belum ada layanan.</div> : null}
      </div>

    </PublicLayout>
  );
}
