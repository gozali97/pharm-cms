import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { fetchSiteSettings } from "@/lib/queries.functions";
import { createContactMessageFn } from "@/lib/contact.functions";

export const Route = createFileRoute("/kontak")({
  component: KontakPage,
  head: () => ({ meta: [{ title: "Kontak — Apotek Sehat" }, { name: "description", content: "Hubungi Apotek Sehat via WhatsApp, telepon, atau email." }] }),
});

const schema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(100),
  contact_info: z.string().trim().min(3, "Kontak (email/telp) wajib diisi").max(200),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5, "Pesan terlalu pendek").max(2000),
});

function KontakPage() {
  const { data: s } = useQuery({ queryKey: ["settings"], queryFn: fetchSiteSettings });
  const [submitting, setSubmitting] = useState(false);
  const wa = s?.whatsapp?.replace(/\D/g, "") ?? "";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: form.get("name"),
      contact_info: form.get("contact_info"),
      subject: form.get("subject") || undefined,
      message: form.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }
    setSubmitting(true);
    const { error } = await createContactMessageFn({ data: parsed.data }).catch((e) => ({ error: e }));
    setSubmitting(false);
    if (error) {
      toast.error("Gagal mengirim pesan. Coba lagi.");
      return;
    }
    toast.success("Pesan terkirim! Kami akan segera merespon.");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <PublicLayout>
      <section className="gradient-hero border-b border-border/50">
        <div className="container-page py-12">
          <h1 className="font-display text-4xl font-bold text-primary-dark">Hubungi Kami</h1>
          <p className="mt-2 text-muted-foreground">Kami senang mendengar dari Anda.</p>
        </div>
      </section>

      <div className="container-page py-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft space-y-4 min-h-[280px]">
            {s?.phone ? <ContactRow icon={Phone} label="Telepon" value={s.phone} href={`tel:${s.phone}`} /> : null}
            {wa ? <ContactRow icon={MessageCircle} label="WhatsApp" value={s?.whatsapp ?? ""} href={`https://wa.me/${wa}`} /> : null}
            {s?.email ? <ContactRow icon={Mail} label="Email" value={s.email} href={`mailto:${s.email}`} /> : null}
            {s?.address ? <ContactRow icon={MapPin} label="Alamat" value={s.address} /> : null}
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft space-y-4">
          <h2 className="font-display text-xl font-bold text-primary-dark">Kirim Pesan</h2>
          <Field label="Nama Lengkap"><input name="name" required maxLength={100} className={fieldClass} /></Field>
          <Field label="Email / No. Telepon"><input name="contact_info" required maxLength={200} className={fieldClass} /></Field>
          <Field label="Subjek (opsional)"><input name="subject" maxLength={200} className={fieldClass} /></Field>
          <Field label="Pesan"><textarea name="message" required rows={5} maxLength={2000} className={fieldClass} /></Field>
          <button disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 font-semibold disabled:opacity-60 hover:opacity-90 transition">
            <Send className="h-4 w-4" /> {submitting ? "Mengirim..." : "Kirim Pesan"}
          </button>
        </form>
      </div>
    </PublicLayout>
  );
}

const fieldClass = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function ContactRow({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  const Inner = (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-primary-light text-primary p-2"><Icon className="h-5 w-5" /></div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block hover:text-primary transition">{Inner}</a> : Inner;
}
