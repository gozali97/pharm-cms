import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
const logoMark = "/images/logo-mark.png";
import { fetchSiteSettings } from "@/lib/queries";

const NAV = [
  { to: "/", label: "Beranda" },
  { to: "/produk", label: "Produk" },
  { to: "/layanan", label: "Layanan" },
  { to: "/promo", label: "Promo" },
  { to: "/artikel", label: "Artikel" },
  { to: "/cabang", label: "Cabang" },
  { to: "/tentang", label: "Tentang" },
  { to: "/faq", label: "FAQ" },
  { to: "/kontak", label: "Kontak" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSiteSettings().then(setSettings);
  }, []);

  const siteName = settings.site_name || "Apotek Sehat";
  const phone = settings.phone || "";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoMark} alt={siteName} className="h-9 w-9" width={36} height={36} />
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold text-primary-dark">{siteName}</span>
            {settings.tagline ? (
              <span className="text-[10px] text-muted-foreground">{settings.tagline}</span>
            ) : null}
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-primary bg-primary-light" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:text-primary hover:bg-primary-light"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground/80 transition hover:border-primary hover:text-primary"
            >
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          ) : null}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex lg:hidden items-center justify-center rounded-md p-2 text-foreground hover:bg-muted"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container-page py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-primary bg-primary-light" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
