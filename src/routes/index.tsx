import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, ShieldCheck, Award, Clock, ChevronRight, Star, ArrowRight, MapPin } from "lucide-react";
const heroImage = "/images/hero-pharmacy.jpg";
import { PublicLayout } from "@/components/public/PublicLayout";
import {
  fetchSiteSettings,
  fetchProductCategories,
  fetchFeaturedProducts,
  fetchFeaturedServices,
  fetchActivePromotions,
  fetchApprovedTestimonials,
  fetchRecentArticles,
  fetchBranches,
} from "@/lib/queries";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { property: "og:image", content: "/images/hero-pharmacy.jpg" },
      { name: "twitter:image", content: "/images/hero-pharmacy.jpg" },
    ],
    links: [{ rel: "preload", as: "image", href: heroImage, fetchpriority: "high" } as any],
  }),
});

function Index() {
  const settings = useQuery({ queryKey: ["settings"], queryFn: fetchSiteSettings });
  const cats = useQuery({ queryKey: ["cats"], queryFn: fetchProductCategories });
  const products = useQuery({ queryKey: ["featured-products"], queryFn: () => fetchFeaturedProducts(8) });
  const services = useQuery({ queryKey: ["featured-services"], queryFn: () => fetchFeaturedServices(6) });
  const promos = useQuery({ queryKey: ["active-promos"], queryFn: fetchActivePromotions });
  const testimonials = useQuery({ queryKey: ["testimonials"], queryFn: fetchApprovedTestimonials });
  const articles = useQuery({ queryKey: ["recent-articles"], queryFn: () => fetchRecentArticles(3) });
  const branches = useQuery({ queryKey: ["branches"], queryFn: fetchBranches });

  const s = settings.data ?? {};
  const wa = s.whatsapp?.replace(/\D/g, "") ?? "";

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">
              <ShieldCheck className="h-3.5 w-3.5" /> Apotek Berizin Resmi
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary-dark">
              {s.tagline || "Sahabat Kesehatan Keluarga Anda"}
            </h1>
            <p className="text-lg text-foreground/80 max-w-xl">
              Konsultasi apoteker gratis, produk lengkap, dan pelayanan cepat. Semua kebutuhan
              obat & kesehatan keluarga tersedia di satu tempat.
            </p>
            <div className="flex flex-wrap gap-3">
              {wa ? (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-90 transition"
                >
                  <MessageCircle className="h-4 w-4" /> Hubungi via WhatsApp
                </a>
              ) : null}
              <Link
                to="/produk"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-5 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
              >
                Lihat Produk <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Apoteker Berpengalaman</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Layanan Cepat</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />
            <img
              src={heroImage}
              alt="Apoteker profesional di apotek kami"
              width={1536}
              height={1024}
              fetchPriority="high"
              decoding="async"
              className="relative rounded-2xl shadow-elegant object-cover w-full h-[400px] lg:h-[500px]"
            />

          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="container-page py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-dark">Kenapa Memilih Kami</h2>
          <p className="mt-2 text-muted-foreground">Kepercayaan yang dibangun dari pelayanan terbaik.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Izin Resmi", desc: "Terdaftar & diawasi otoritas farmasi." },
            { icon: Award, title: "Apoteker Ahli", desc: "Konsultasi gratis dengan apoteker bersertifikat STRA/SIPA." },
            { icon: Clock, title: "Cepat & Ramah", desc: "Respon WhatsApp singkat, layanan hangat." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-card p-6 shadow-soft border border-border/60 hover:shadow-elegant transition">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      {(cats.data ?? []).length > 0 && (
        <section className="container-page py-12">
          <SectionTitle title="Kategori Produk" subtitle="Jelajahi produk sesuai kebutuhan Anda" link="/produk" />
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {(cats.data ?? []).slice(0, 12).map((c) => (
              <Link
                key={c.id}
                to="/produk"
                search={{ kategori: c.slug }}
                className="group rounded-xl bg-card p-4 text-center shadow-soft border border-border/60 hover:border-primary transition"
              >
                {c.icon_image ? (
                  <img src={c.icon_image} alt={c.name} className="mx-auto h-14 w-14 rounded-lg object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="mx-auto h-14 w-14 rounded-lg bg-primary-light text-primary flex items-center justify-center font-display font-bold text-2xl">
                    {c.name.charAt(0)}
                  </div>
                )}
                <div className="mt-3 text-sm font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      {(products.data ?? []).length > 0 && (
        <section className="container-page py-12">
          <SectionTitle title="Produk Unggulan" subtitle="Pilihan terbaik dari apoteker kami" link="/produk" />
          <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(products.data ?? []).map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* SERVICES */}
      {(services.data ?? []).length > 0 && (
        <section className="bg-primary-light/40 py-16">
          <div className="container-page">
            <SectionTitle title="Layanan Kami" subtitle="Lebih dari sekadar apotek" link="/layanan" />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {(services.data ?? []).map((sv) => (
                <div key={sv.id} className="rounded-2xl bg-card p-6 shadow-soft border border-border/60 hover:shadow-elegant transition">
                  {sv.icon_image ? (
                    <img src={sv.icon_image} alt={sv.name} className="h-14 w-14 rounded-xl object-cover mb-4" loading="lazy" decoding="async" />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 font-display font-bold text-xl">
                      {sv.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-semibold text-lg">{sv.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{sv.short_description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROMOTIONS */}
      {(promos.data ?? []).length > 0 && (
        <section className="container-page py-16">
          <SectionTitle title="Promo Aktif" subtitle="Jangan lewatkan penawaran spesial" link="/promo" />
          <div className="grid gap-5 md:grid-cols-2">
            {(promos.data ?? []).slice(0, 4).map((pr) => (
              <div key={pr.id} className="relative overflow-hidden rounded-2xl border border-border shadow-soft group">
                {pr.banner_image ? (
                  <img src={pr.banner_image} alt={pr.title} width={1200} height={560} sizes="(min-width:768px) 50vw, 100vw" className="h-56 w-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" decoding="async" />
                ) : (
                  <div className="h-56 gradient-primary flex items-center justify-center text-primary-foreground font-display text-3xl font-bold px-6 text-center">
                    {pr.title}
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-promo px-3 py-1 text-xs font-bold text-promo-foreground shadow">PROMO</span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg">{pr.title}</h3>
                  {pr.description ? <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{pr.description}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {(testimonials.data ?? []).length > 0 && (
        <section className="bg-gradient-to-b from-background to-primary-light/30 py-16">
          <div className="container-page">
            <SectionTitle title="Kata Pelanggan" subtitle="Kepercayaan yang membuat kami terus tumbuh" />
            <div className="grid gap-5 md:grid-cols-3">
              {(testimonials.data ?? []).slice(0, 6).map((t) => (
                <div key={t.id} className="rounded-2xl bg-card p-6 shadow-soft border border-border/60">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-promo text-promo" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 italic">"{t.content}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    {t.photo ? (
                      <img src={t.photo} alt={t.customer_name} className="h-10 w-10 rounded-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {t.customer_name.charAt(0)}
                      </div>
                    )}
                    <div className="font-medium text-sm">{t.customer_name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ARTICLES */}
      {(articles.data ?? []).length > 0 && (
        <section className="container-page py-16">
          <SectionTitle title="Artikel Kesehatan" subtitle="Tips & informasi dari apoteker kami" link="/artikel" />
          <div className="grid gap-6 md:grid-cols-3">
            {(articles.data ?? []).map((a) => (
              <Link
                key={a.id}
                to="/artikel/$slug"
                params={{ slug: a.slug }}
                className="group rounded-2xl overflow-hidden bg-card shadow-soft border border-border/60 hover:shadow-elegant transition"
              >
                {a.cover_image ? (
                  <img src={a.cover_image} alt={a.title} width={800} height={400} sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="h-48 w-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" decoding="async" />
                ) : (
                  <div className="h-48 gradient-primary" />
                )}
                <div className="p-5">
                  {a.article_categories ? (
                    <div className="text-xs font-semibold text-primary mb-2">{a.article_categories.name}</div>
                  ) : null}
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition">{a.title}</h3>
                  {a.excerpt ? <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* BRANCHES */}
      {(branches.data ?? []).length > 0 && (
        <section className="container-page py-12">
          <SectionTitle title="Cabang Kami" subtitle="Temukan apotek terdekat" link="/cabang" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(branches.data ?? []).slice(0, 6).map((b) => (
              <div key={b.id} className="rounded-2xl bg-card p-5 shadow-soft border border-border/60">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary-light text-primary p-2"><MapPin className="h-5 w-5" /></div>
                  <div>
                    <h3 className="font-semibold">{b.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{b.address}</p>
                    {b.phone ? <p className="text-sm text-primary mt-2">{b.phone}</p> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page py-16">
        <div className="rounded-3xl gradient-primary p-10 md:p-14 text-center text-primary-foreground shadow-elegant">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Butuh Bantuan Apoteker?</h2>
          <p className="mt-3 max-w-2xl mx-auto text-primary-foreground/90">
            Konsultasikan kebutuhan obat dan kesehatan Anda gratis via WhatsApp. Kami siap membantu.
          </p>
          {wa ? (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-background text-primary-dark px-6 py-3 font-semibold hover:opacity-90 transition"
            >
              <MessageCircle className="h-5 w-5" /> Chat Sekarang
            </a>
          ) : null}
        </div>
      </section>
    </PublicLayout>
  );
}

function SectionTitle({ title, subtitle, link }: { title: string; subtitle?: string; link?: string }) {
  return (
    <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-dark">{title}</h2>
        {subtitle ? <p className="mt-1 text-muted-foreground">{subtitle}</p> : null}
      </div>
      {link ? (
        <Link to={link} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Lihat semua <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function ProductCard({ p }: { p: any }) {
  return (
    <Link
      to="/produk/$slug"
      params={{ slug: p.slug }}
      className="group rounded-2xl bg-card overflow-hidden shadow-soft border border-border/60 hover:shadow-elegant transition flex flex-col"
    >
      <div className="aspect-square bg-primary-light/40 relative overflow-hidden">
        {p.main_image ? (
          <img src={p.main_image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" decoding="async" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-primary-dark/40 font-display font-bold text-5xl">
            {p.name.charAt(0)}
          </div>
        )}
        {p.requires_prescription ? (
          <span className="absolute top-2 left-2 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5">RESEP</span>
        ) : null}
        {p.is_featured ? (
          <span className="absolute top-2 right-2 rounded-full bg-promo text-promo-foreground text-[10px] font-bold px-2 py-0.5">TERLARIS</span>
        ) : null}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {p.product_categories ? (
          <div className="text-xs text-muted-foreground">{p.product_categories.name}</div>
        ) : null}
        <h3 className="font-semibold text-sm line-clamp-2 mt-1 group-hover:text-primary transition">{p.name}</h3>
        <div className="mt-auto pt-3 flex items-center justify-between">
          {p.show_price && p.price ? (
            <span className="font-bold text-primary text-sm">Rp {Number(p.price).toLocaleString("id-ID")}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Hubungi kami</span>
          )}
          <span className={`text-xs font-medium ${p.stock_status === "tersedia" ? "text-primary" : "text-muted-foreground"}`}>
            {p.stock_status === "tersedia" ? "Tersedia" : p.stock_status === "habis" ? "Habis" : "Pre-order"}
          </span>
        </div>
      </div>
    </Link>
  );
}
