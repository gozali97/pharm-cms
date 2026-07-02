import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth, doSignIn, doSignUp } from "@/lib/auth";
const logoMark = "/images/logo-mark.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Masuk Admin — Apotek Sehat" }, { name: "robots", content: "noindex" }] }),
});

const schema = z.object({
  email: z.string().trim().email("Email tidak valid").max(200),
  password: z.string().min(6, "Password minimal 6 karakter").max(128),
});

function AuthPage() {
  const nav = useNavigate();
  const { user, loading, setUser } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) nav({ to: "/admin" });
  }, [loading, user, nav]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Data tidak valid");
    setBusy(true);
    const { email, password } = parsed.data;
    const res = mode === "login"
      ? await doSignIn(email, password)
      : await doSignUp(email, password);
    setBusy(false);
    console.log("[auth] signIn result:", JSON.stringify(res));
    if ("error" in res) return toast.error(res.error);
    if (mode === "signup") {
      toast.success("Akun dibuat. Silakan login.");
      setMode("login");
    } else {
      // Login succeeded — update local user state then redirect immediately.
      toast.success("Berhasil masuk.");
      setUser(res.user ?? null);
      nav({ to: "/admin" });
    }
  }

  async function google() {
    toast.info("Login Google belum tersedia pada mode lokal SQLite");
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-card shadow-elegant border border-border/60 p-8">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <img src={logoMark} alt="Logo" className="h-10 w-10" />
          <span className="font-display text-xl font-bold text-primary-dark">Apotek Sehat</span>
        </Link>
        <h1 className="font-display text-2xl font-bold text-center">{mode === "login" ? "Masuk ke Admin" : "Daftar Akun Admin"}</h1>
        <p className="text-sm text-center text-muted-foreground mt-1">Kelola konten apotek Anda</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input name="email" type="email" required maxLength={200} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input name="password" type="password" required minLength={6} maxLength={128} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </label>
          <button disabled={busy} className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-semibold hover:opacity-90 disabled:opacity-60 transition">
            {busy ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px bg-border flex-1" /> atau <div className="h-px bg-border flex-1" />
        </div>
        <button onClick={google} className="w-full rounded-lg border border-input bg-background py-2.5 text-sm font-medium hover:bg-muted transition">
          Masuk dengan Google
        </button>

        <div className="mt-6 text-center text-sm">
          {mode === "login" ? (
            <>Belum punya akun? <button onClick={() => setMode("signup")} className="text-primary font-semibold">Daftar</button></>
          ) : (
            <>Sudah punya akun? <button onClick={() => setMode("login")} className="text-primary font-semibold">Masuk</button></>
          )}
        </div>
      </div>
    </div>
  );
}
