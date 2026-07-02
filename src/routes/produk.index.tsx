import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchProducts, fetchProductCategories } from "@/lib/queries";
import { z } from "zod";

const searchSchema = z.object({ kategori: z.string().optional(), q: z.string().optional() });

export const Route = createFileRoute("/produk/")({
  component: ProdukPage,
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Produk & Obat — Apotek Sehat" }, { name: "description", content: "Katalog lengkap produk & obat dari Apotek Sehat." }] }),
});

function ProdukPage() {
  const { kategori, q } = Route.useSearch();
  const [search, setSearch] = useState(q ?? "");
  const cats = useQuery({ queryKey: ["cats"], queryFn: fetchProductCategories });
  const products = useQuery({
    queryKey: ["products", kategori, q],
    queryFn: () => fetchProducts({ category: kategori, search: q }),
  });

  return (
    <PublicLayout>
      <section className="gradient-hero border-b border-border/50">
        <div className="container-page py-12">
          <h1 className="font-display text-4xl font-bold text-primary-dark">Produk & Obat</h1>
          <p className="mt-2 text-muted-foreground">Temukan kebutuhan kesehatan Anda</p>
        </div>
      </section>

      <div className="container-page py-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.search = new URLSearchParams({ ...(kategori ? { kategori } : {}), ...(search ? { q: search } : {}) }).toString();
            }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </form>
          <div className="pt-4 min-h-[320px]">
            <h2 className="font-semibold mb-2 text-sm uppercase tracking-wide text-primary-dark">Kategori</h2>
            <Link to="/produk/" className={`block rounded-md px-3 py-2 text-sm hover:bg-muted ${!kategori ? "bg-primary-light text-primary font-medium" : ""}`}>
              Semua
            </Link>
            {(cats.data ?? []).map((c) => (
              <Link key={c.id} to="/produk/" search={{ kategori: c.slug }} className={`block rounded-md px-3 py-2 text-sm hover:bg-muted ${kategori === c.slug ? "bg-primary-light text-primary font-medium" : ""}`}>
                {c.name}
              </Link>
            ))}
          </div>
        </aside>

        <div>
          {products.isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Memuat...</div>
          ) : (products.data ?? []).length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">Belum ada produk.</div>
          ) : (
            <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {(products.data ?? []).map((p) => (
                <Link
                  key={p.id}
                  to="/produk/$slug"
                  params={{ slug: p.slug }}
                  className="group rounded-2xl bg-card overflow-hidden shadow-soft border border-border/60 hover:shadow-elegant transition"
                >
                  <div className="aspect-square bg-primary-light/40 relative">
                    {p.main_image ? (
                      <img src={p.main_image} alt={p.name} width={400} height={400} sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" className="h-full w-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" decoding="async" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-primary-dark/40 font-display font-bold text-5xl">{p.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition">{p.name}</h2>
                    {p.show_price && p.price ? (
                      <div className="mt-2 font-bold text-primary text-sm">Rp {Number(p.price).toLocaleString("id-ID")}</div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
