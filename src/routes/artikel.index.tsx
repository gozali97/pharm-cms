import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchArticles } from "@/lib/queries";

export const Route = createFileRoute("/artikel/")({
  component: ArtikelPage,
  head: () => ({ meta: [{ title: "Artikel Kesehatan — Apotek Sehat" }, { name: "description", content: "Kumpulan artikel kesehatan dari apoteker profesional kami." }] }),
});

function ArtikelPage() {
  const { data } = useQuery({ queryKey: ["articles"], queryFn: fetchArticles });
  return (
    <PublicLayout>
      <section className="gradient-hero border-b border-border/50">
        <div className="container-page py-12">
          <h1 className="font-display text-4xl font-bold text-primary-dark">Artikel Kesehatan</h1>
          <p className="mt-2 text-muted-foreground">Tips & informasi terpercaya untuk kesehatan Anda.</p>
        </div>
      </section>
      <div className="container-page py-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((a) => (
          <Link key={a.id} to="/artikel/$slug" params={{ slug: a.slug }} className="group rounded-2xl overflow-hidden bg-card shadow-soft border border-border/60 hover:shadow-elegant transition">
            {a.cover_image ? (
              <img src={a.cover_image} alt={a.title} width={800} height={400} sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="h-48 w-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" decoding="async" />
            ) : (
              <div className="h-48 gradient-primary" />
            )}
            <div className="p-5">
              {a.article_categories ? <div className="text-xs font-semibold text-primary mb-2">{a.article_categories.name}</div> : null}
              <h2 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition">{a.title}</h2>
              {a.excerpt ? <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p> : null}
            </div>
          </Link>
        ))}
        {(data ?? []).length === 0 ? <div className="col-span-full text-center py-16 text-muted-foreground">Belum ada artikel.</div> : null}
      </div>
    </PublicLayout>
  );
}
