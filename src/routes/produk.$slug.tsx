import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchProductBySlug, fetchSiteSettings } from "@/lib/queries";

export const Route = createFileRoute("/produk/$slug")({
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery({ queryKey: ["product", slug], queryFn: () => fetchProductBySlug(slug) });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSiteSettings });
  const wa = settings?.whatsapp?.replace(/\D/g, "") ?? "";

  if (isLoading) return <PublicLayout><div className="container-page py-24 text-center text-muted-foreground">Memuat...</div></PublicLayout>;
  if (!product) throw notFound();

  return (
    <PublicLayout>
      <div className="container-page py-8">
        <Link to="/produk" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Produk
        </Link>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-2xl overflow-hidden bg-primary-light/40 aspect-square">
            {product.main_image ? (
              <img src={product.main_image} alt={product.name} width={800} height={800} decoding="async" fetchPriority="high" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full flex items-center justify-center text-primary-dark/30 font-display font-bold text-8xl">{product.name.charAt(0)}</div>
            )}
          </div>
          <div>
            {product.product_categories ? (
              <div className="text-sm text-primary font-medium">{product.product_categories.name}</div>
            ) : null}
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-1 text-primary-dark">{product.name}</h1>
            {product.show_price && product.price ? (
              <div className="mt-4 text-3xl font-bold text-primary">Rp {Number(product.price).toLocaleString("id-ID")}<span className="text-sm text-muted-foreground font-normal"> / {product.unit ?? "unit"}</span></div>
            ) : null}
            <p className="mt-4 text-foreground/80">{product.short_description}</p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${product.stock_status === "tersedia" ? "bg-primary-light text-primary-dark" : "bg-muted text-muted-foreground"}`}>
                {product.stock_status === "tersedia" ? "Tersedia" : product.stock_status === "habis" ? "Habis" : "Pre-order"}
              </span>
              {product.requires_prescription ? (
                <span className="rounded-full bg-destructive/10 text-destructive px-3 py-1 text-xs font-medium">Butuh Resep Dokter</span>
              ) : null}
            </div>
            {wa ? (
              <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Halo, saya ingin tanya tentang ${product.name}`)}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-3 font-semibold hover:opacity-90 transition">
                <MessageCircle className="h-4 w-4" /> Tanya via WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        {product.description ? (
          <div className="mt-12 max-w-3xl">
            <h2 className="font-display text-xl font-bold mb-3 text-primary-dark">Deskripsi</h2>
            <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">{product.description}</div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2 max-w-3xl">
          {product.composition ? <InfoBox title="Kandungan/Komposisi" text={product.composition} /> : null}
          {product.indication ? <InfoBox title="Indikasi" text={product.indication} /> : null}
          {product.dosage ? <InfoBox title="Dosis / Aturan Pakai" text={product.dosage} /> : null}
        </div>
      </div>
    </PublicLayout>
  );
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="text-sm font-semibold text-primary-dark mb-1">{title}</div>
      <div className="text-sm text-foreground/80 whitespace-pre-wrap">{text}</div>
    </div>
  );
}
