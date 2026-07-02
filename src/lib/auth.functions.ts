import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  createSession, deleteSession, getUserByEmail, assignRole,
  cookieValue, clearCookieValue, SESSION_COOKIE, SESSION_MAX_AGE_DAYS,
  verifyPassword, type SessionUser,
} from "@/lib/server/auth.server";
import { getSessionUser } from "@/lib/server/auth.server";
import { readSessionCookie } from "@/lib/server/session";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const user = getSessionUser(readSessionCookie());
  return user satisfies SessionUser | null;
});

export const signIn = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ email: z.string().email(), password: z.string().min(6) }).parse(d),
  )
  .handler(async ({ data }) => {
    const user = getUserByEmail(data.email);
    if (!user || !verifyPassword(data.password, user.password_hash)) {
      return { error: "Email atau password salah" };
    }
    const token = await createSession(user.id);
    setResponseHeader("Set-Cookie", cookieValue(SESSION_MAX_AGE_DAYS).replace("<token>", token));
    // Return the session user directly so the client can update state + redirect
    // without a second round-trip (the cookie may not be readable yet).
    const sessionUser = getSessionUser(token);
    return { ok: true, user: sessionUser };
  });

export const signUp = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ email: z.string().email().max(200), password: z.string().min(6).max(128) }).parse(d),
  )
  .handler(async ({ data }) => {
    const existing = getUserByEmail(data.email);
    if (existing) return { error: "Email sudah terdaftar" };
    const { createUser } = await import("@/lib/server/auth.server");
    const result = await createUser({ email: data.email, password: data.password });
    if ("error" in result) return { error: result.error };
    // New sign-ups get "staf" role by default (no admin access until promoted)
    assignRole(result.id, "staf");
    return { ok: true };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const token = readSessionCookie();
  if (token) deleteSession(token);
  setResponseHeader("Set-Cookie", clearCookieValue());
  return { ok: true };
});
