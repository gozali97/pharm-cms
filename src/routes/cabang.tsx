import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchBranches } from "@/lib/queries";

export const Route = createFileRoute("/cabang")({
  component: CabangPage,
  head: () => ({ meta: [{ title: "Cabang — Apotek Sehat" }, { name: "description", content: "Temukan cabang Apotek Sehat terdekat." }] }),
});

function CabangPage() {
  const { data } = useQuery({ queryKey: ["branches"], queryFn: fetchBranches });
  return (
    <PublicLayout>
      <section className="gradient-hero border-b border-border/50">
        <div className="container-page py-12">
          <h1 className="font-display text-4xl font-bold text-primary-dark">Cabang & Lokasi</h1>
          <p className="mt-2 text-muted-foreground">Kunjungi cabang terdekat dari lokasi Anda.</p>
        </div>
      </section>
      <div className="container-page py-10 grid gap-6 md:grid-cols-2">
        {(data ?? []).map((b) => {
          const oh = (b.operating_hours ?? {}) as Record<string, string>;
          return (
            <div key={b.id} className="rounded-2xl bg-card p-6 shadow-soft border border-border/60">
              {b.photo ? (
                <img src={b.photo} alt={b.name} width={1200} height={480} sizes="(min-width:768px) 50vw, 100vw" className="rounded-xl mb-4 h-48 w-full object-cover" loading="lazy" decoding="async" />
              ) : null}
              <h2 className="font-display text-xl font-bold text-primary-dark">{b.name}</h2>
              <div className="mt-3 space-y-2 text-sm text-foreground/80">
                <div className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary" /> {b.address}</div>
                {b.phone ? <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <a href={`tel:${b.phone}`} className="hover:text-primary">{b.phone}</a></div> : null}
                {b.whatsapp ? <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-primary" /> <a href={`https://wa.me/${b.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-primary">WhatsApp</a></div> : null}
                {Object.keys(oh).length > 0 ? (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-primary-dark font-medium mb-1"><Clock className="h-4 w-4" /> Jam Buka</div>
                    <ul className="ml-6 text-xs text-muted-foreground">
                      {Object.entries(oh).map(([k, v]) => <li key={k}><span className="capitalize">{k.replace("_", " - ")}</span>: {v}</li>)}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
        {(data ?? []).length === 0 ? <div className="col-span-full text-center py-16 text-muted-foreground">Belum ada cabang.</div> : null}
      </div>
    </PublicLayout>
  );
}
