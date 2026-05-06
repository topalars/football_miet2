import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const COOKIE_NAME = 'pitch_admin';
const MAX_AGE = 60 * 60 * 8;

function getSecret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'dev-only-admin-secret';
}

function getPassword() {
  return process.env.ADMIN_PASSWORD || 'admin';
}

function sign(payload: string): string {
  const h = crypto.createHmac('sha256', getSecret());
  h.update(payload);
  return h.digest('hex');
}

export function createSessionToken(): string {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [role, expStr, sig] = token.split('.');
  if (role !== 'admin' || !expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = sign(`${role}.${expStr}`);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export function checkPassword(input: string): boolean {
  const expected = getPassword();
  if (input.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

export async function isAdminAuthed(): Promise<boolean> {
  const c = await cookies();
  return verifyToken(c.get(COOKIE_NAME)?.value);
}

export const ADMIN_COOKIE = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE;
