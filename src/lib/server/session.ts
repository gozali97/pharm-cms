// Helper to read the session cookie inside TanStack Start server functions.
import { getRequestEvent } from "@tanstack/react-start/server";
import { getSessionUser, type SessionUser, SESSION_COOKIE } from "./auth.server";

export function readSessionCookie(): string | null {
  try {
    const event = getRequestEvent();
    const req = (event as any)?.node?.req ?? (event as any)?.request;
    const cookieHeader = req?.headers?.get?.("cookie") ?? req?.headers?.cookie ?? "";
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function getCurrentUser(): SessionUser | null {
  return getSessionUser(readSessionCookie());
}

export function requireUser(): SessionUser {
  const user = getCurrentUser();
  if (!user) throw new Error("Unauthorized: silakan login terlebih dahulu");
  return user;
}

export function requireAdmin(): SessionUser {
  const user = requireUser();
  const isAdmin = user.roles.includes("super_admin") || user.roles.includes("admin_konten");
  if (!isAdmin) throw new Error("Forbidden: akses admin diperlukan");
  return user;
}

export function requireSuperAdmin(): SessionUser {
  const user = requireUser();
  if (!user.roles.includes("super_admin")) throw new Error("Forbidden: super admin only");
  return user;
}
