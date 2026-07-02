import { useEffect, useState } from "react";
import { getSession, signIn, signUp, signOut } from "@/lib/auth.functions";
import type { AppRole } from "@/lib/server/auth.server";

export type { AppRole };

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  roles: AppRole[];
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const u = await getSession();
    setUser(u as AuthUser | null);
    setLoading(false);
    return u;
  };

  useEffect(() => {
    let mounted = true;
    getSession().then((u) => {
      if (!mounted) return;
      setUser(u as AuthUser | null);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const roles = user?.roles ?? [];
  const isAdmin = roles.includes("super_admin") || roles.includes("admin_konten");
  const isSuperAdmin = roles.includes("super_admin");

  return { user, roles, isAdmin, isSuperAdmin, loading, refresh, setUser };
}

export async function doSignIn(email: string, password: string) {
  const res = await signIn({ data: { email, password } });
  // signIn returns { ok: true, user } on success, or { error: string } on failure.
  return res as { ok: true; user: AuthUser | null } | { error: string };
}

export async function doSignUp(email: string, password: string) {
  const res = await signUp({ data: { email, password } });
  return res;
}

export async function doSignOut() {
  await signOut();
}
