import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createUser, assignRole, removeRole, deleteUserAccount, setUserPassword, listUsersWithRoles,
  type AppRole,
} from "@/lib/server/auth.server";
import { requireSuperAdmin, getCurrentUser } from "@/lib/server/session";

export const createUserFn = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      email: z.string().email().max(200),
      password: z.string().min(6).max(128),
      full_name: z.string().trim().max(120).optional(),
      role: z.enum(["super_admin", "admin_konten", "staf"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    requireSuperAdmin();
    const result = await createUser({ email: data.email, password: data.password, full_name: data.full_name });
    if ("error" in result) throw new Error(result.error);
    if (data.role) assignRole(result.id, data.role);
    return { id: result.id };
  });

export const deleteUserFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const me = requireSuperAdmin();
    if (data.userId === me.id) throw new Error("Tidak bisa menghapus akun sendiri");
    deleteUserAccount(data.userId);
    return { ok: true };
  });

export const setUserPasswordFn = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ userId: z.string(), password: z.string().min(6).max(128) }).parse(d),
  )
  .handler(async ({ data }) => {
    requireSuperAdmin();
    await setUserPassword(data.userId, data.password);
    return { ok: true };
  });

export const toggleRoleFn = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({ userId: z.string(), role: z.enum(["super_admin", "admin_konten", "staf"]), has: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    if (data.has) removeRole(data.userId, data.role as AppRole);
    else assignRole(data.userId, data.role as AppRole);
    return { ok: true };
  });

export const listUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  return listUsersWithRoles();
});
