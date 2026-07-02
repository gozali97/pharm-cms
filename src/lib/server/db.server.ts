// Server-only SQLite data layer. Imported dynamically from server function handlers
// so that `better-sqlite3` (a native Node module) never ends up in the client bundle.
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { hashPassword } from "./crypto.server";

export const DB_PATH = resolve(process.cwd(), "data", "app.db");
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function uuid() {
  return randomUUID();
}

export function now() {
  return new Date().toISOString();
}

export const all = <T = any>(sql: string, params: any[] = []): T[] =>
  db.prepare(sql).all(...params) as T[];

export const get = <T = any>(sql: string, params: any[] = []): T | undefined =>
  db.prepare(sql).get(...params) as T | undefined;

export const run = (sql: string, params: any[] = []) =>
  db.prepare(sql).run(...params);

/** Run a function inside a single transaction. */
export function tx<T>(fn: () => T): T {
  const t = db.transaction(fn);
  return t();
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin','admin_konten','staf')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, role)
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_image TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT REFERENCES product_categories(id) ON DELETE SET NULL,
  short_description TEXT,
  description TEXT,
  main_image TEXT,
  gallery TEXT DEFAULT '[]',
  price REAL,
  show_price INTEGER NOT NULL DEFAULT 1,
  unit TEXT,
  composition TEXT,
  indication TEXT,
  dosage TEXT,
  stock_status TEXT NOT NULL DEFAULT 'tersedia',
  requires_prescription INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  meta_title TEXT,
  meta_description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_image TEXT,
  short_description TEXT,
  description TEXT,
  price REAL,
  duration TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  banner_image TEXT,
  description TEXT,
  promo_code TEXT,
  start_date TEXT,
  end_date TEXT,
  cta_link TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS article_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  latitude REAL,
  longitude REAL,
  phone TEXT,
  whatsapp TEXT,
  operating_hours TEXT DEFAULT '{}',
  photo TEXT,
  map_embed TEXT,
  status TEXT NOT NULL DEFAULT 'buka',
  is_published INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  license_number TEXT,
  photo TEXT,
  bio TEXT,
  branch_id TEXT REFERENCES branches(id) ON DELETE SET NULL,
  is_published INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id TEXT REFERENCES article_categories(id) ON DELETE SET NULL,
  cover_image TEXT,
  excerpt TEXT,
  content TEXT,
  author_id TEXT REFERENCES team_members(id) ON DELETE SET NULL,
  published_at TEXT,
  tags TEXT DEFAULT '[]',
  read_time INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  meta_title TEXT,
  meta_description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS testimonials (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  photo TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  content TEXT NOT NULL,
  testimonial_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  alt_text TEXT,
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

db.exec(SCHEMA);

// ---------------------------------------------------------------------------
// Seed defaults (only on a fresh database)
// ---------------------------------------------------------------------------
async function seed() {
  const hasUsers = get<{ c: number }>("SELECT COUNT(*) AS c FROM users")!.c;
  if (hasUsers > 0) return;

  const adminId = uuid();
  const { hash } = await hashPassword("admin123");
  run(
    "INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
    [adminId, "admin@apoteksehat.id", hash, "Admin Apotek"],
  );
  run("INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)", [
    uuid(),
    adminId,
    "super_admin",
  ]);

  const settings = {
    site_name: "Apotek Sehat",
    tagline: "Sahabat Kesehatan Keluarga Anda",
    whatsapp: "628123456789",
    phone: "021-1234567",
    email: "halo@apoteksehat.id",
    address: "Jl. Kesehatan No. 1, Jakarta",
    instagram: "",
    facebook: "",
    tiktok: "",
    footer_text: "Melayani dengan hati, dipercaya sejak lama.",
    map_embed: "",
    meta_title: "Apotek Sehat - Sahabat Kesehatan Keluarga",
    meta_description:
      "Apotek terpercaya dengan layanan konsultasi apoteker, produk lengkap, dan harga bersahabat.",
    accent_color: "#16A34A",
    og_image: "",
  };
  run("INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)", [
    "general",
    JSON.stringify(settings),
    now(),
  ]);
}

// top-level await is fine inside an ESM server module; ensure seed completes once.
await seed();

export { db };
