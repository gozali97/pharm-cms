import { createServerFn } from "@tanstack/react-start";
import * as repo from "@/lib/server/repo.server";
import { requireSuperAdmin } from "@/lib/server/session";

export const saveSiteSettingsFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as Record<string, any>)
  .handler(async ({ data }) => {
    requireSuperAdmin();
    repo.saveSiteSettings(data);
    return { ok: true };
  });
