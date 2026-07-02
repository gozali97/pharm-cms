import { uploadMediaFn, listMediaFn, deleteMediaFn } from "@/lib/media.functions";

export async function uploadMedia(file: File, altText?: string) {
  const fd = new FormData();
  fd.append("file", file);
  if (altText) fd.append("alt_text", altText);
  const result = await uploadMediaFn({ data: fd as any });
  return { file_url: (result as any).file_url };
}

export async function listMedia() {
  return listMediaFn();
}

export async function deleteMedia(id: string) {
  return deleteMediaFn({ data: { id } });
}
