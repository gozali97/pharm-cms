import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchSiteSettings } from "@/lib/queries.functions";
import { saveSiteSettingsFn } from "@/lib/settings.functions";
import { ImagePicker } from "@/components/admin/FormControls";

export const Route = createFileRoute("/admin/pengaturan")({ component: Settings });

type Fields = {
  site_name: string; tagline: string; phone: string; whatsapp: string; email: string; address: string;
  operating_hours_global: string; instagram: string; facebook: string; tiktok: string; footer_text: string;
  map_embed: string; meta_title: string; meta_description: string; meta_og_image: string; logo: string; favicon: string; accent_color: string;
};

const DEFAULTS: Fields = { site_name: "", tagline: "", phone: "", whatsapp: "", email: "", address: "", operating_hours_global: "", instagram: "", facebook: "", tiktok: "", footer_text: "", map_embed: "", meta_title: "", meta_description: "", meta_og_image: "", logo: "", favicon: "", accent_color: "#16a34a" };

function Settings() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Fields>(DEFAULTS);
  const { data } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => fetchSiteSettings(),
  });

  useEffect(() => { if (data) setForm({ ...DEFAULTS, ...data }); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      await saveSiteSettingsFn({ data: form });
    },
    onSuccess: () => { toast.success("Pengaturan tersimpan"); qc.invalidateQueries({ queryKey: ["site_settings"] }); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: (e: any) => toast.error(e.message ?? "Gagal menyimpan"),
  });

  const inp = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const F = (name: keyof Fields, label: string, opts: { textarea?: boolean; type?: string; help?: string } = {}) => (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {opts.textarea ? (
        <textarea rows={3} value={form[name]} onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))} className={inp} />
      ) : (
        <input type={opts.type ?? "text"} value={form[name]} onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))} className={inp} />
      )}
      {opts.help ? <div className="mt-1 text-xs text-muted-foreground">{opts.help}</div> : null}
    </label>
  );

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-primary-dark mb-1">Pengaturan Situs</h1>
      <p className="text-sm text-muted-foreground mb-6">Semua pengaturan ini digunakan di seluruh landing page.</p>

      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-8">
        <Section title="Identitas">
          <div className="grid gap-4 md:grid-cols-2">
            {F("site_name", "Nama Apotek")}
            {F("tagline", "Tagline")}
            <ImagePicker value={form.logo} onChange={(v) => setForm((p) => ({ ...p, logo: v ?? "" }))} label="Logo" />
            <ImagePicker value={form.favicon} onChange={(v) => setForm((p) => ({ ...p, favicon: v ?? "" }))} label="Favicon" />
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Warna Aksen (hex, palet hijau)</span>
              <input type="color" value={form.accent_color} onChange={(e) => setForm((p) => ({ ...p, accent_color: e.target.value }))} className="h-10 w-24 rounded border border-input" />
              <div className="mt-1 text-xs text-muted-foreground">Hindari warna ungu — brand kami hijau.</div>
            </label>
          </div>
        </Section>

        <Section title="Kontak">
          <div className="grid gap-4 md:grid-cols-2">
            {F("phone", "Telepon")}
            {F("whatsapp", "Nomor WhatsApp", { help: "Format: 628xxxx (tanpa tanda +)" })}
            {F("email", "Email", { type: "email" })}
            {F("address", "Alamat Pusat", { textarea: true })}
            {F("operating_hours_global", "Jam Operasional Global", { help: 'Contoh: {"senin_jumat":"08:00-21:00","sabtu":"08:00-20:00","minggu":"09:00-18:00"}' })}
          </div>
        </Section>

        <Section title="Sosial Media">
          <div className="grid gap-4 md:grid-cols-3">
            {F("instagram", "Instagram URL")}
            {F("facebook", "Facebook URL")}
            {F("tiktok", "TikTok URL")}
          </div>
        </Section>

        <Section title="Footer & Peta">
          {F("footer_text", "Teks Footer", { textarea: true })}
          {F("map_embed", "Google Maps Embed URL", { help: "Iframe src dari Google Maps" })}
        </Section>

        <Section title="SEO Default">
          <div className="grid gap-4 md:grid-cols-2">
            {F("meta_title", "Meta Title")}
            {F("meta_description", "Meta Description", { textarea: true })}
          </div>
          <div className="mt-4"><ImagePicker value={form.meta_og_image} onChange={(v) => setForm((p) => ({ ...p, meta_og_image: v ?? "" }))} label="OG Image" /></div>
        </Section>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border py-4 -mx-6 md:-mx-8 px-6 md:px-8">
          <button disabled={save.isPending} className="rounded-lg bg-primary text-primary-foreground px-6 py-2.5 font-semibold hover:opacity-90 disabled:opacity-60">
            {save.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-6">
      <h2 className="font-display font-bold text-primary-dark mb-4">{title}</h2>
      {children}
    </div>
  );
}
