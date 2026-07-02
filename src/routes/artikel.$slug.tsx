import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchArticleBySlug } from "@/lib/queries";

export const Route = createFileRoute("/artikel/$slug")({
  component: ArticleDetail,
});

function ArticleDetail() {
  const { slug } = Route.useParams();
  const { data: article, isLoading } = useQuery({ queryKey: ["article", slug], queryFn: () => fetchArticleBySlug(slug) });

  if (isLoading) return <PublicLayout><div className="container-page py-24 text-center text-muted-foreground">Memuat...</div></PublicLayout>;
  if (!article) throw notFound();

  return (
    <PublicLayout>
      <article className="container-page py-8 max-w-3xl mx-auto">
        <Link to="/artikel" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Semua Artikel
        </Link>
        {article.article_categories ? <div className="text-sm text-primary font-medium">{article.article_categories.name}</div> : null}
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 text-primary-dark">{article.title}</h1>
        <div className="mt-3 text-sm text-muted-foreground flex gap-3">
          {article.team_members ? <span>Oleh {article.team_members.name}</span> : null}
          {article.published_at ? <span>· {new Date(article.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span> : null}
          {article.read_time ? <span>· {article.read_time} menit baca</span> : null}
        </div>
        {article.cover_image ? (
          <div className="mt-6 rounded-2xl overflow-hidden bg-primary-light/30 aspect-[16/9] max-h-[480px]">
            <img src={article.cover_image} alt={article.title} width={1600} height={900} decoding="async" fetchPriority="high" className="w-full h-full object-cover" />
          </div>
        ) : null}
        {article.excerpt ? <p className="mt-6 text-lg text-foreground/80 leading-relaxed">{article.excerpt}</p> : null}
        {article.content ? (
          <div className="mt-6 whitespace-pre-wrap text-foreground/85 leading-relaxed">{article.content}</div>
        ) : null}
      </article>
    </PublicLayout>
  );
}
