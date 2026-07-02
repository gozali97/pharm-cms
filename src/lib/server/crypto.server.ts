// Pure crypto helpers (no DB dependency) — safe to import from anywhere server-side.
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;
const SALT_LEN = 16;

export async function hashPassword(password: string): Promise<{ hash: string }> {
  const salt = randomBytes(SALT_LEN).toString("hex");
  const derived = scryptSync(password, salt, KEY_LEN).toString("hex");
  // format: <salt>:<derived>
  return { hash: `${salt}:${derived}` };
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, derivedHex] = stored.split(":");
  if (!salt || !derivedHex) return false;
  const derived = Buffer.from(derivedHex, "hex");
  const test = scryptSync(password, salt, KEY_LEN);
  if (test.length !== derived.length) return false;
  return timingSafeEqual(test, derived);
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}
