import { promises as fs } from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export type StoredUser = {
  id: number;
  username: string;
  passwordHash: string;
  firstname: string;
  lastname: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
};

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, '[]', 'utf8');
  }
}

export async function readUsers(): Promise<StoredUser[]> {
  await ensureFile();
  const raw = await fs.readFile(USERS_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredUser[]) {
  await ensureFile();
  const tmp = USERS_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(users, null, 2), 'utf8');
  await fs.rename(tmp, USERS_FILE);
}

export async function findByUsername(username: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((u) => u.username === username) ?? null;
}

export async function createUser(
  data: Omit<StoredUser, 'id' | 'createdAt'>,
): Promise<StoredUser> {
  const users = await readUsers();
  if (users.some((u) => u.username === data.username)) {
    throw new Error('username_taken');
  }
  const id = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const user: StoredUser = {
    id,
    createdAt: new Date().toISOString(),
    ...data,
  };
  users.push(user);
  await writeUsers(users);
  return user;
}

export async function listUsers(): Promise<Array<Omit<StoredUser, 'passwordHash'>>> {
  const users = await readUsers();
  return users.map(({ passwordHash, ...rest }) => rest);
}
