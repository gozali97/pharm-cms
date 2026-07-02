import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Instagram, Facebook, Phone, Mail, MapPin, Clock } from "lucide-react";
const logoMark = "/images/logo-mark.png";
import { fetchSiteSettings } from "@/lib/queries";

export function SiteFooter() {
  const [s, setS] = useState<Record<string, string>>({});
  useEffect(() => {
    fetchSiteSettings().then(setS);
  }, []);

  return (
    <footer className="mt-24 border-t border-border bg-primary-light/40">
      <div className="container-page py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <img src={logoMark} alt="" className="h-9 w-9" width={36} height={36} loading="lazy" decoding="async" />
            <div>
              <div className="font-display text-lg font-bold text-primary-dark">
                {s.site_name || "Apotek Sehat"}
              </div>
              {s.tagline ? (
                <div className="text-xs text-muted-foreground">{s.tagline}</div>
              ) : null}
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            {s.footer_text ||
              "Melayani dengan hati, dipercaya sejak lama. Konsultasikan kebutuhan kesehatan Anda dengan apoteker profesional kami."}
          </p>
          <div className="flex gap-3 pt-2">
            {s.instagram ? (
              <a
                href={s.instagram}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-background p-2 text-primary hover:bg-primary hover:text-primary-foreground transition"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}
            {s.facebook ? (
              <a
                href={s.facebook}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-background p-2 text-primary hover:bg-primary hover:text-primary-foreground transition"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-dark">
            Tautan
          </h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/produk" className="text-muted-foreground hover:text-primary">Produk</Link></li>
            <li><Link to="/layanan" className="text-muted-foreground hover:text-primary">Layanan</Link></li>
            <li><Link to="/promo" className="text-muted-foreground hover:text-primary">Promo</Link></li>
            <li><Link to="/artikel" className="text-muted-foreground hover:text-primary">Artikel</Link></li>
            <li><Link to="/cabang" className="text-muted-foreground hover:text-primary">Cabang</Link></li>
            <li><Link to="/tentang" className="text-muted-foreground hover:text-primary">Tentang Kami</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-dark">
            Kontak
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {s.phone ? (
              <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-primary" />{s.phone}</li>
            ) : null}
            {s.email ? (
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-primary" />{s.email}</li>
            ) : null}
            {s.address ? (
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-primary" />{s.address}</li>
            ) : null}
            {s.operating_hours ? (
              <li className="flex items-start gap-2"><Clock className="h-4 w-4 mt-0.5 text-primary" />{s.operating_hours}</li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-5 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} {s.site_name || "Apotek Sehat"}. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
}
