import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchFAQs } from "@/lib/queries";

export const Route = createFileRoute("/faq")({
  component: FAQPage,
  head: () => ({ meta: [{ title: "FAQ — Apotek Sehat" }, { name: "description", content: "Pertanyaan umum seputar layanan Apotek Sehat." }] }),
});

function FAQPage() {
  const { data } = useQuery({ queryKey: ["faqs"], queryFn: fetchFAQs });
  const [open, setOpen] = useState<string | null>(null);
  return (
    <PublicLayout>
      <section className="gradient-hero border-b border-border/50">
        <div className="container-page py-12">
          <h1 className="font-display text-4xl font-bold text-primary-dark">Pertanyaan Umum</h1>
          <p className="mt-2 text-muted-foreground">Jawaban untuk pertanyaan yang sering ditanyakan.</p>
        </div>
      </section>
      <div className="container-page py-10 max-w-3xl">
        <div className="space-y-3">
          {(data ?? []).map((f) => {
            const isOpen = open === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="w-full text-left rounded-xl border border-border bg-card p-5 hover:border-primary transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-foreground">{f.question}</div>
                  <ChevronDown className={`h-5 w-5 text-primary transition ${isOpen ? "rotate-180" : ""}`} />
                </div>
                {isOpen ? <div className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{f.answer}</div> : null}
              </button>
            );
          })}
          {(data ?? []).length === 0 ? <div className="text-center py-16 text-muted-foreground">Belum ada FAQ.</div> : null}
        </div>
      </div>
    </PublicLayout>
  );
}
