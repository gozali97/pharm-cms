import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import * as repo from "@/lib/server/repo.server";

export const createContactMessageFn = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z.object({
      name: z.string().trim().min(1).max(100),
      contact_info: z.string().trim().min(3).max(200),
      subject: z.string().trim().max(200).optional(),
      message: z.string().trim().min(5).max(2000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    repo.createContactMessage(data);
    return { ok: true };
  });

export const updateContactMessageStatusFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ id: z.string(), status: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/server/session");
    requireAdmin();
    repo.updateContactMessageStatus(data.id, data.status);
    return { ok: true };
  });

export const deleteContactMessageFn = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/server/session");
    requireAdmin();
    repo.deleteContactMessage(data.id);
    return { ok: true };
  });
