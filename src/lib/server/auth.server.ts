// Server-only auth: sessions + user management backed by SQLite.
import { all, get, run, uuid, now } from "./db.server";
import { hashPassword, verifyPassword, randomToken } from "./crypto.server";

export type AppRole = "super_admin" | "admin_konten" | "staf";

export const SESSION_COOKIE = "apotek_session";
export const SESSION_MAX_AGE_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  full_name: string | null;
  roles: AppRole[];
};

export function cookieValue(days: number): string {
  return `${SESSION_COOKIE}=<token>; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
    days * 86400
  }`;
}

export function clearCookieValue(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function createSession(userId: string): Promise<string> {
  const token = randomToken(32);
  const expires = new Date(
    Date.now() + SESSION_MAX_AGE_DAYS * 86400 * 1000,
  ).toISOString();
  run(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
    [token, userId, expires],
  );
  return token;
}

export function deleteSession(token: string): void {
  run("DELETE FROM sessions WHERE token = ?", [token]);
}

export function getUserByEmail(email: string) {
  return get<{ id: string; email: string; password_hash: string; full_name: string | null }>(
    "SELECT id, email, password_hash, full_name FROM users WHERE email = ?",
    [email],
  );
}

export function getSessionUser(token: string | null | undefined): SessionUser | null {
  if (!token) return null;
  const row = get<{ id: string; email: string; full_name: string | null; expires_at: string }>(
    `SELECT u.id, u.email, u.full_name, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ?`,
    [token],
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    run("DELETE FROM sessions WHERE token = ?", [token]);
    return null;
  }
  const roles = all<{ role: AppRole }>(
    "SELECT role FROM user_roles WHERE user_id = ?",
    [row.id],
  ).map((r) => r.role);
  return { id: row.id, email: row.email, full_name: row.full_name, roles };
}

export async function createUser(args: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<{ id: string } | { error: string }> {
  const existing = getUserByEmail(args.email);
  if (existing) return { error: "Email sudah terdaftar" };
  const id = uuid();
  const { hash } = await hashPassword(args.password);
  run(
    "INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
    [id, args.email, hash, args.full_name ?? args.email.split("@")[0]],
  );
  return { id };
}

export function assignRole(userId: string, role: AppRole): void {
  run("INSERT OR IGNORE INTO user_roles (id, user_id, role) VALUES (?, ?, ?)", [
    uuid(),
    userId,
    role,
  ]);
}

export function removeRole(userId: string, role: AppRole): void {
  run("DELETE FROM user_roles WHERE user_id = ? AND role = ?", [userId, role]);
}

export async function setUserPassword(userId: string, password: string): Promise<void> {
  const { hash } = await hashPassword(password);
  run("UPDATE users SET password_hash = ? WHERE id = ?", [hash, userId]);
}

export function deleteUserAccount(userId: string): void {
  run("DELETE FROM users WHERE id = ?", [userId]);
}

export function listUsersWithRoles() {
  const users = all<{
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
  }>("SELECT id, email, full_name, created_at FROM users ORDER BY created_at DESC");
  const roles = all<{ user_id: string; role: AppRole }>(
    "SELECT user_id, role FROM user_roles",
  );
  const byUser = new Map<string, AppRole[]>();
  for (const r of roles) {
    const arr = byUser.get(r.user_id) ?? [];
    arr.push(r.role);
    byUser.set(r.user_id, arr);
  }
  return users.map((u) => ({ ...u, roles: byUser.get(u.id) ?? [] }));
}

export { verifyPassword };
