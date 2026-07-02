// Server-only data access layer — all SQLite queries/mutations.
import { all, get, run, uuid, now } from "./db.server";
import type { AppRole } from "./auth.server";

// ---- helpers: JSON columns stored as TEXT ----
function parseJson<T = any>(v: string | null | undefined, fallback: T): T {
  if (!v) return fallback;
  try { return JSON.parse(v) as T; } catch { return fallback; }
}
function bool(v: any): boolean { return v === 1 || v === true; }
function toInt(v: any): number | null { return v === null || v === undefined ? null : Number(v); }

// ---- site settings ----
export function getSiteSettings(): Record<string, any> {
  const row = get<{ value: string }>("SELECT value FROM site_settings WHERE key = 'general'");
  return row ? parseJson(row.value, {}) : {};
}
export function saveSiteSettings(value: Record<string, any>): void {
  run("INSERT INTO site_settings (key, value, updated_at) VALUES ('general', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at", [JSON.stringify(value), now()]);
}

// ---- products ----
export function listProductCategories() {
  return all("SELECT * FROM product_categories ORDER BY display_order ASC, name ASC");
}
export function listFeaturedProducts(limit = 8) {
  const rows = all<any>("SELECT * FROM products WHERE status = 'published' AND is_featured = 1 ORDER BY created_at DESC LIMIT ?", [limit]);
  return rows.map(attachProductCategory);
}
export function listProducts(opts: { category?: string; search?: string } = {}) {
  let sql = "SELECT * FROM products WHERE status = 'published'";
  const params: any[] = [];
  if (opts.search) { sql += " AND name LIKE ?"; params.push(`%${opts.search}%`); }
  sql += " ORDER BY created_at DESC";
  let rows = all<any>(sql, params);
  if (opts.category) {
    const cats = all<any>("SELECT id FROM product_categories WHERE slug = ?", [opts.category]);
    if (cats.length) rows = rows.filter((p) => p.category_id === cats[0].id);
    else rows = [];
  }
  return rows.map(attachProductCategory);
}
export function getProductBySlug(slug: string) {
  const row = get<any>("SELECT * FROM products WHERE slug = ? AND status = 'published'", [slug]);
  return row ? attachProductCategory(row) : null;
}
function attachProductCategory(p: any) {
  if (p.category_id) {
    const c = get<{ name: string; slug: string }>("SELECT name, slug FROM product_categories WHERE id = ?", [p.category_id]);
    p.product_categories = c ?? null;
  } else { p.product_categories = null; }
  p.gallery = parseJson(p.gallery, []);
  p.show_price = bool(p.show_price);
  p.requires_prescription = bool(p.requires_prescription);
  p.is_featured = bool(p.is_featured);
  return p;
}

// ---- services ----
export function listFeaturedServices(limit = 6) {
  return all("SELECT * FROM services WHERE status = 'published' ORDER BY is_featured DESC, created_at DESC LIMIT ?", [limit]).map(attachService);
}
export function listServices() {
  return all("SELECT * FROM services WHERE status = 'published' ORDER BY is_featured DESC, created_at DESC").map(attachService);
}
function attachService(s: any) {
  s.is_featured = bool(s.is_featured);
  return s;
}

// ---- promotions ----
export function listActivePromotions() {
  const nowIso = now();
  return all(
    `SELECT * FROM promotions WHERE status = 'published'
       AND (start_date IS NULL OR start_date <= ?)
       AND (end_date IS NULL OR end_date >= ?)
     ORDER BY created_at DESC`,
    [nowIso, nowIso],
  );
}

// ---- articles ----
export function listRecentArticles(limit = 3) {
  return all<any>(
    `SELECT * FROM articles WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC LIMIT ?`,
    [limit],
  ).map(attachArticle);
}
export function listArticles() {
  return all<any>("SELECT * FROM articles WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC").map(attachArticle);
}
export function getArticleBySlug(slug: string) {
  const row = get<any>("SELECT * FROM articles WHERE slug = ? AND status = 'published'", [slug]);
  return row ? attachArticle(row) : null;
}
function attachArticle(a: any) {
  if (a.category_id) {
    const c = get<{ name: string; slug: string }>("SELECT name, slug FROM article_categories WHERE id = ?", [a.category_id]);
    a.article_categories = c ?? null;
  } else { a.article_categories = null; }
  if (a.author_id) {
    const t = get<{ name: string; photo: string | null; position: string | null }>("SELECT name, photo, position FROM team_members WHERE id = ?", [a.author_id]);
    a.team_members = t ?? null;
  } else { a.team_members = null; }
  a.tags = parseJson(a.tags, []);
  return a;
}

// ---- testimonials ----
export function listApprovedTestimonials() {
  return all("SELECT * FROM testimonials WHERE status = 'approved' ORDER BY created_at DESC");
}

// ---- branches ----
export function listBranches() {
  return all<any>("SELECT * FROM branches WHERE is_published = 1 ORDER BY display_order ASC, name ASC").map(attachBranch);
}
function attachBranch(b: any) {
  b.operating_hours = parseJson(b.operating_hours, {});
  b.is_published = bool(b.is_published);
  return b;
}

// ---- team ----
export function listTeam() {
  return all<any>("SELECT * FROM team_members WHERE is_published = 1 ORDER BY display_order ASC, name ASC").map(attachTeam);
}
function attachTeam(t: any) {
  if (t.branch_id) {
    const b = get<{ name: string }>("SELECT name FROM branches WHERE id = ?", [t.branch_id]);
    t.branches = b ?? null;
  } else { t.branches = null; }
  t.is_published = bool(t.is_published);
  return t;
}

// ---- faqs ----
export function listFaqs() {
  return all("SELECT * FROM faqs WHERE is_published = 1 ORDER BY display_order ASC, question ASC");
}

// ---- contact messages ----
export function createContactMessage(data: { name: string; contact_info: string; subject?: string; message: string }) {
  run("INSERT INTO contact_messages (id, name, contact_info, subject, message, status) VALUES (?, ?, ?, ?, ?, 'new')",
    [uuid(), data.name, data.contact_info, data.subject ?? null, data.message]);
}
export function listContactMessages() {
  return all("SELECT * FROM contact_messages ORDER BY created_at DESC");
}
export function updateContactMessageStatus(id: string, status: string) {
  run("UPDATE contact_messages SET status = ? WHERE id = ?", [status, id]);
}
export function deleteContactMessage(id: string) {
  run("DELETE FROM contact_messages WHERE id = ?", [id]);
}

// ---- generic CRUD for admin (CmsResource) ----
export type TableConfig = {
  table: string;
  select?: string; // ignored — we select all + relations
  orderBy?: { column: string; ascending?: boolean };
  searchField?: string;
  relations?: { localKey: string; table: string; labelField: string; as: string }[];
};

const RELATION_MAP: Record<string, { localKey: string; table: string; labelField: string; as: string }[]> = {
  products: [{ localKey: "category_id", table: "product_categories", labelField: "name", as: "product_categories" }],
  articles: [
    { localKey: "category_id", table: "article_categories", labelField: "name", as: "article_categories" },
    { localKey: "author_id", table: "team_members", labelField: "name", as: "team_members" },
  ],
  team_members: [{ localKey: "branch_id", table: "branches", labelField: "name", as: "branches" }],
};

const BOOLEAN_FIELDS: Record<string, string[]> = {
  products: ["show_price", "requires_prescription", "is_featured"],
  services: ["is_featured"],
  branches: ["is_published"],
  team_members: ["is_published"],
  faqs: ["is_published"],
};

const JSON_FIELDS: Record<string, string[]> = {
  products: ["gallery"],
  branches: ["operating_hours"],
  articles: ["tags"],
};

export function listTableRows(table: string, opts: { orderBy?: { column: string; ascending?: boolean }; searchField?: string; search?: string } = {}): any[] {
  let sql = `SELECT * FROM ${table}`;
  const params: any[] = [];
  if (opts.search && opts.searchField) { sql += ` WHERE ${opts.searchField} LIKE ?`; params.push(`%${opts.search}%`); }
  const ob = opts.orderBy;
  if (ob) sql += ` ORDER BY ${ob.column} ${ob.ascending ? "ASC" : "DESC"}`;
  let rows = all<any>(sql, params);
  const rels = RELATION_MAP[table];
  if (rels) {
    rows = rows.map((r) => {
      for (const rel of rels) {
        if (r[rel.localKey]) {
          const ref = get<any>(`SELECT ${rel.labelField} FROM ${rel.table} WHERE id = ?`, [r[rel.localKey]]);
          r[rel.as] = ref ?? null;
        } else { r[rel.as] = null; }
      }
      return r;
    });
  }
  return rows.map((r) => normalizeRow(table, r));
}

export function insertRow(table: string, payload: Record<string, any>): void {
  const cols = Object.keys(payload).filter((k) => payload[k] !== undefined);
  const vals = cols.map((k) => prepareValue(table, k, payload[k]));
  const placeholders = cols.map(() => "?").join(", ");
  run(`INSERT INTO ${table} (id, ${cols.join(", ")}) VALUES (?, ${placeholders})`, [uuid(), ...vals]);
  // touch updated_at if present
  tryUpdateTimestamp(table);
}

export function updateRow(table: string, id: string, payload: Record<string, any>): void {
  const cols = Object.keys(payload).filter((k) => payload[k] !== undefined && k !== "id");
  if (cols.length === 0) return;
  const sets = cols.map((k) => `${k} = ?`).join(", ");
  const vals = cols.map((k) => prepareValue(table, k, payload[k]));
  run(`UPDATE ${table} SET ${sets}${hasTimestampColumn(table) ? ", updated_at = ?" : ""} WHERE id = ?`, [...vals, ...(hasTimestampColumn(table) ? [now()] : []), id]);
}

export function deleteRow(table: string, id: string): void {
  run(`DELETE FROM ${table} WHERE id = ?`, [id]);
}

export function countRows(table: string, filter?: Record<string, any>): number {
  let sql = `SELECT COUNT(*) AS c FROM ${table}`;
  const params: any[] = [];
  const conds = Object.entries(filter ?? {}).map(([k, v]) => { params.push(v); return `${k} = ?`; });
  if (conds.length) sql += " WHERE " + conds.join(" AND ");
  return get<{ c: number }>(sql, params)?.c ?? 0;
}

// ---- media ----
export function insertMedia(data: { file_name: string; file_path: string; file_url: string; mime_type?: string; size_bytes?: number; alt_text?: string; uploaded_by?: string }) {
  run("INSERT INTO media (id, file_name, file_path, file_url, mime_type, size_bytes, alt_text, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [uuid(), data.file_name, data.file_path, data.file_url, data.mime_type ?? null, data.size_bytes ?? null, data.alt_text ?? null, data.uploaded_by ?? null]);
}
export function listMedia() {
  return all("SELECT * FROM media ORDER BY created_at DESC");
}
export function getMedia(id: string) {
  return get<any>("SELECT * FROM media WHERE id = ?", [id]);
}
export function deleteMediaRow(id: string) {
  const row = get<{ file_path: string }>("SELECT file_path FROM media WHERE id = ?", [id]);
  run("DELETE FROM media WHERE id = ?", [id]);
  return row?.file_path ?? null;
}

// ---- options for select fields ----
export function listOptions(table: string, labelField: string) {
  return all<{ id: string; label: string }>(`SELECT id, ${labelField} AS label FROM ${table} ORDER BY ${labelField} ASC`);
}

// ---- internal helpers ----
function normalizeRow(table: string, r: any): any {
  for (const f of BOOLEAN_FIELDS[table] ?? []) r[f] = bool(r[f]);
  for (const f of JSON_FIELDS[table] ?? []) r[f] = parseJson(r[f], null);
  return r;
}
function prepareValue(table: string, col: string, val: any): any {
  if (val === "" ) return null;
  if ((BOOLEAN_FIELDS[table] ?? []).includes(col)) return val ? 1 : 0;
  if ((JSON_FIELDS[table] ?? []).includes(col) && typeof val === "object") return JSON.stringify(val);
  return val;
}
function hasTimestampColumn(table: string): boolean {
  return ["products", "services", "promotions", "branches", "product_categories"].includes(table);
}
function tryUpdateTimestamp(table: string): void { /* no-op, handled in updateRow */ }
