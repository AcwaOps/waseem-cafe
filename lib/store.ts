import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';
import { initialMenu } from './menu';

export type MenuItem = {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  hot?: number;
  iced?: number;
  price?: number;
  description?: string;
  notes?: string;
  tag?: string;
  image?: string;
  active: boolean;
};

const KEY = 'waseem-cafe:menu:v2';
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'menu.json');

// In-memory cache for fast local access
let memoryStore: MenuItem[] | null = null;

async function readFromFile(): Promise<MenuItem[] | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {}
  return null;
}

async function writeToFile(menu: MenuItem[]) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(menu, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local menu backup:', err);
  }
}

export async function readMenu(): Promise<MenuItem[]> {
  // 1. Try Vercel KV if environment variables are present
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const stored = await kv.get<MenuItem[]>(KEY);
      if (stored?.length) return stored;
    } catch (e) {
      console.warn('Vercel KV read failed, falling back to local storage:', e);
    }
  }

  // 2. Try in-memory store
  if (memoryStore && memoryStore.length > 0) {
    return memoryStore;
  }

  // 3. Try local file storage
  const fileData = await readFromFile();
  if (fileData) {
    memoryStore = fileData;
    return fileData;
  }

  // 4. Fallback to initialMenu
  memoryStore = [...initialMenu];
  return memoryStore;
}

export async function writeMenu(menu: MenuItem[]) {
  memoryStore = menu;

  // Persist to local file
  await writeToFile(menu);

  // Persist to Vercel KV if available
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.set(KEY, menu);
    } catch (e) {
      console.warn('Vercel KV write failed:', e);
    }
  }
}
