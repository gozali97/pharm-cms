import { useEffect, useRef, useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cmsOptions } from "@/lib/cms.functions";
import { uploadMedia } from "@/lib/media";

/** Reusable image picker: shows current URL as preview, allows uploading new file. */
export function ImagePicker({ value, onChange, label = "Gambar" }: { value?: string | null; onChange: (url: string | null) => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    if (!f.type.startsWith("image/")) return toast.error("File harus berupa gambar");
    if (f.size > 10 * 1024 * 1024) return toast.error("Ukuran gambar maks 10MB");
    setBusy(true);
    try {
      const row = await uploadMedia(f);
      onChange(row.file_url);
    } catch (e) {
      toast.error("Upload gagal: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-1 text-sm font-medium">{label}</div>
      <div className="flex items-center gap-3">
        <div className="h-20 w-20 rounded-lg bg-muted border border-border overflow-hidden flex items-center justify-center">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1 text-sm rounded-md border border-input px-3 py-1.5 hover:bg-muted disabled:opacity-60"
          >
            <Upload className="h-3.5 w-3.5" /> {busy ? "Mengunggah..." : "Unggah Gambar"}
          </button>
          {value ? (
            <button type="button" onClick={() => onChange(null)} className="text-xs text-destructive hover:underline text-left">Hapus</button>
          ) : null}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "richtext" | "number" | "boolean" | "select" | "date" | "image" | "slug" | "email";
  required?: boolean;
  options?: { value: string; label: string }[];
  optionsFrom?: { table: "product_categories" | "article_categories" | "team_members" | "branches"; labelField: string };
  from?: string; // for slug: source field name
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  colSpan?: 1 | 2;
  help?: string;
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 100);
}

export function ResourceField({ field, value, setValue, allValues }: {
  field: FieldDef; value: any; setValue: (v: any) => void; allValues: Record<string, any>;
}) {
  const [dynOpts, setDynOpts] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (!field.optionsFrom) return;
    cmsOptions({ data: { table: field.optionsFrom.table, labelField: field.optionsFrom.labelField } }).then((data: any) => {
      setDynOpts((data ?? []).map((r: any) => ({ value: r.id, label: r.label })));
    });
  }, [field.optionsFrom?.table, field.optionsFrom?.labelField]);

  const opts = field.options ?? dynOpts;
  const inp = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  const label = <div className="mb-1 text-sm font-medium">{field.label}{field.required ? " *" : ""}</div>;

  switch (field.type) {
    case "textarea":
    case "richtext":
      return (
        <div className={field.colSpan === 2 ? "md:col-span-2" : ""}>
          {label}
          <textarea rows={field.rows ?? (field.type === "richtext" ? 10 : 3)} value={value ?? ""} onChange={(e) => setValue(e.target.value)} className={inp} placeholder={field.placeholder} />
          {field.help ? <div className="mt-1 text-xs text-muted-foreground">{field.help}</div> : null}
        </div>
      );
    case "number":
      return (
        <div className={field.colSpan === 2 ? "md:col-span-2" : ""}>
          {label}
          <input type="number" value={value ?? ""} min={field.min} max={field.max} step={field.step ?? 1} onChange={(e) => setValue(e.target.value === "" ? null : Number(e.target.value))} className={inp} />
        </div>
      );
    case "boolean":
      return (
        <label className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={!!value} onChange={(e) => setValue(e.target.checked)} className="h-4 w-4 rounded border-input text-primary" />
          <span className="text-sm">{field.label}</span>
        </label>
      );
    case "select":
      return (
        <div className={field.colSpan === 2 ? "md:col-span-2" : ""}>
          {label}
          <select value={value ?? ""} onChange={(e) => setValue(e.target.value || null)} className={inp}>
            <option value="">— pilih —</option>
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    case "date":
      return (
        <div>{label}<input type="datetime-local" value={value ? new Date(value).toISOString().slice(0, 16) : ""} onChange={(e) => setValue(e.target.value ? new Date(e.target.value).toISOString() : null)} className={inp} /></div>
      );
    case "image":
      return <div className={field.colSpan === 2 ? "md:col-span-2" : ""}><ImagePicker value={value} onChange={setValue} label={field.label} /></div>;
    case "slug":
      return (
        <div>{label}
          <div className="flex gap-2">
            <input value={value ?? ""} onChange={(e) => setValue(e.target.value)} className={inp} placeholder="slug-url" />
            {field.from ? (
              <button type="button" onClick={() => setValue(slugify(allValues[field.from!] ?? ""))} className="rounded-md border border-input px-3 text-xs hover:bg-muted">Auto</button>
            ) : null}
          </div>
        </div>
      );
    default:
      return (
        <div className={field.colSpan === 2 ? "md:col-span-2" : ""}>
          {label}
          <input type={field.type === "email" ? "email" : "text"} value={value ?? ""} onChange={(e) => setValue(e.target.value)} className={inp} placeholder={field.placeholder} />
        </div>
      );
  }
}

/** Slide-over drawer wrapper */
export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-background border-l border-border overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-2 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
