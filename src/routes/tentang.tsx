import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchTeam, fetchSiteSettings } from "@/lib/queries";
import { Award, ShieldCheck, Heart } from "lucide-react";

export const Route = createFileRoute("/tentang")({
  component: TentangPage,
  head: () => ({ meta: [{ title: "Tentang Kami — Apotek Sehat" }, { name: "description", content: "Kenali tim apoteker profesional kami." }] }),
});

function TentangPage() {
  const { data: team } = useQuery({ queryKey: ["team"], queryFn: fetchTeam });
  const { data: s } = useQuery({ queryKey: ["settings"], queryFn: fetchSiteSettings });

  return (
    <PublicLayout>
      <section className="gradient-hero border-b border-border/50">
        <div className="container-page py-12">
          <h1 className="font-display text-4xl font-bold text-primary-dark">Tentang Kami</h1>
          <p className="mt-2 text-muted-foreground">{s?.tagline}</p>
        </div>
      </section>

      <div className="container-page py-12 max-w-4xl">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Visi", text: "Menjadi apotek keluarga terpercaya yang mengedepankan pelayanan dan mutu." },
            { icon: Heart, title: "Misi", text: "Memberikan produk berkualitas, konsultasi profesional, dan harga bersahabat." },
            { icon: Award, title: "Nilai", text: "Integritas, empati, dan kepatuhan pada regulasi farmasi." },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl bg-card p-6 shadow-soft border border-border/60">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary"><v.icon className="h-5 w-5" /></div>
              <h2 className="font-semibold text-lg">{v.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </div>

      {(team ?? []).length > 0 ? (
        <div className="container-page py-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-dark mb-6">Tim Apoteker Kami</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(team ?? []).map((m) => (
              <div key={m.id} className="rounded-2xl bg-card p-6 shadow-soft border border-border/60 text-center">
                {m.photo ? (
                  <img src={m.photo} alt={m.name} width={112} height={112} className="mx-auto h-28 w-28 rounded-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="mx-auto h-28 w-28 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-3xl font-bold">{m.name.charAt(0)}</div>
                )}
                <h2 className="mt-4 font-semibold">{m.name}</h2>
                {m.position ? <div className="text-sm text-primary">{m.position}</div> : null}
                {m.license_number ? <div className="text-xs text-muted-foreground mt-1">No. Izin: {m.license_number}</div> : null}
                {m.bio ? <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </PublicLayout>
  );
}
