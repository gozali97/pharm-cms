import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchActivePromotions } from "@/lib/queries";

export const Route = createFileRoute("/promo")({
  component: PromoPage,
  head: () => ({ meta: [{ title: "Promo — Apotek Sehat" }, { name: "description", content: "Promo aktif dari Apotek Sehat." }] }),
});

function PromoPage() {
  const { data } = useQuery({ queryKey: ["promos"], queryFn: fetchActivePromotions });
  return (
    <PublicLayout>
      <section className="gradient-hero border-b border-border/50">
        <div className="container-page py-12">
          <h1 className="font-display text-4xl font-bold text-primary-dark">Promo Aktif</h1>
          <p className="mt-2 text-muted-foreground">Penawaran terbaik minggu ini.</p>
        </div>
      </section>
      <div className="container-page py-10 grid gap-6 md:grid-cols-2">
        {(data ?? []).map((p) => (
          <div key={p.id} className="rounded-2xl overflow-hidden bg-card shadow-soft border border-border/60">
            {p.banner_image ? (
              <img src={p.banner_image} alt={p.title} width={1200} height={560} sizes="(min-width:768px) 50vw, 100vw" className="h-56 w-full object-cover" loading="lazy" decoding="async" />
            ) : (
              <div className="h-56 gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold px-6 text-center">{p.title}</div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-promo px-3 py-1 text-xs font-bold text-promo-foreground">PROMO</span>
                {p.promo_code ? <span className="rounded-md border border-dashed border-primary text-primary px-2 py-0.5 text-xs font-mono">{p.promo_code}</span> : null}
              </div>
              <h2 className="font-semibold text-lg">{p.title}</h2>
              {p.description ? <p className="mt-1 text-sm text-muted-foreground">{p.description}</p> : null}
              {p.end_date ? <div className="mt-3 text-xs text-muted-foreground">Berakhir: {new Date(p.end_date).toLocaleDateString("id-ID")}</div> : null}
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 ? <div className="col-span-full text-center py-16 text-muted-foreground">Belum ada promo aktif.</div> : null}
      </div>
    </PublicLayout>
  );
}
