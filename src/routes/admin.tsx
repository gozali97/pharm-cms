import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, LayoutDashboard, Package, Tag, Wrench, Megaphone, FileText, FolderTree, Star, MapPin, Users, HelpCircle, Inbox, Image, Settings, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useAuth, doSignOut } from "@/lib/auth";
const logoMark = "/images/logo-mark.png";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — Apotek Sehat" }, { name: "robots", content: "noindex,nofollow" }] }),
});

type NavItem = { to: string; label: string; icon: any; end?: boolean; superOnly?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/produk", label: "Produk", icon: Package },
  { to: "/admin/kategori", label: "Kategori Produk", icon: Tag },
  { to: "/admin/layanan", label: "Layanan", icon: Wrench },
  { to: "/admin/promo", label: "Promo", icon: Megaphone },
  { to: "/admin/artikel", label: "Artikel", icon: FileText },
  { to: "/admin/kategori-artikel", label: "Kategori Artikel", icon: FolderTree },
  { to: "/admin/testimoni", label: "Testimoni", icon: Star },
  { to: "/admin/cabang", label: "Cabang", icon: MapPin },
  { to: "/admin/tim", label: "Tim Apoteker", icon: Users },
  { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { to: "/admin/pesan", label: "Pesan Masuk", icon: Inbox },
  { to: "/admin/media", label: "Media Library", icon: Image },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings, superOnly: true },
  { to: "/admin/pengguna", label: "Pengguna & Role", icon: UserCog, superOnly: true },
];

function AdminLayout() {
  const { user, isAdmin, isSuperAdmin, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  async function signOut() {
    await doSignOut();
    toast.success("Berhasil keluar");
    nav({ to: "/auth" });
  }

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center rounded-2xl bg-card p-8 border border-border shadow-soft">
          <h1 className="font-display text-xl font-bold text-primary-dark">Akses ditolak</h1>
          <p className="mt-2 text-sm text-muted-foreground">Akun Anda belum memiliki akses admin. Hubungi Super Admin untuk diberi role.</p>
          <button onClick={signOut} className="mt-4 rounded-lg border border-input px-4 py-2 text-sm hover:bg-muted">Keluar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-64 shrink-0 bg-card border-r border-border/60 flex flex-col sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-5 py-4 border-b border-border/60">
          <img src={logoMark} alt="Logo" className="h-8 w-8" />
          <div>
            <div className="font-display font-bold text-primary-dark leading-tight">Apotek CMS</div>
            <div className="text-[10px] text-muted-foreground">Panel Admin</div>
          </div>
        </Link>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.filter((n) => !n.superOnly || isSuperAdmin).map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.end }}
              activeProps={{ className: "bg-primary-light text-primary font-semibold" }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted transition"
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border/60">
          <div className="mb-2 text-xs text-muted-foreground truncate">{user.email}</div>
          <button onClick={signOut} className="w-full inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-muted">
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
