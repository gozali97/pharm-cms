import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import * as repo from "@/lib/server/repo.server";
import { requireAdmin } from "@/lib/server/session";

const UPLOAD_DIR = "public/uploads";

export const uploadMediaFn = createServerFn({ method: "POST" })
  .validator((d: any) => {
    const fd = d as FormData;
    const file = fd.get("file") as File | null;
    const altText = fd.get("alt_text") as string | null;
    if (!file) throw new Error("No file provided");
    return { file, altText };
  })
  .handler(async ({ data }) => {
    const user = requireAdmin();
    const { file, altText } = data;
    if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar");
    if (file.size > 10 * 1024 * 1024) throw new Error("Ukuran gambar maks 10MB");

    const fs = await import("node:fs/promises");
    const { resolve } = await import("node:path");
    await fs.mkdir(resolve(process.cwd(), UPLOAD_DIR), { recursive: true });

    const ext = file.name.split(".").pop() ?? "bin";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const absPath = resolve(process.cwd(), UPLOAD_DIR, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absPath, buffer);

    const fileUrl = `/uploads/${fileName}`;
    repo.insertMedia({
      file_name: file.name,
      file_path: `${UPLOAD_DIR}/${fileName}`,
      file_url: fileUrl,
      mime_type: file.type,
      size_bytes: file.size,
      alt_text: altText ?? undefined,
      uploaded_by: user.id,
    });
    return { file_url: fileUrl };
  });

export const listMediaFn = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  return repo.listMedia();
});

export const deleteMediaFn = createServerFn({ method: "POST" })
  .validator((d: any) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    requireAdmin();
    const filePath = repo.deleteMediaRow(data.id);
    if (filePath) {
      const fs = await import("node:fs/promises");
      const { resolve } = await import("node:path");
      try { await fs.unlink(resolve(process.cwd(), filePath)); } catch { /* ignore */ }
    }
  return { ok: true };
});
