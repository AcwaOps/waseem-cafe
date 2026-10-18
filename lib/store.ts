import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';
import { initialMenu } from './menu';

export * from './types';
import type { MenuItem, CafeSettings } from './types';
import { defaultPaymentSettings } from './types';

const KEY = 'waseem-cafe:menu:v2';
const SETTINGS_KEY = 'waseem-cafe:settings:v1';
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'menu.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// In-memory cache for fast local access
let memoryStore: MenuItem[] | null = null;
let memorySettings: CafeSettings | null = null;

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
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const stored = await kv.get<MenuItem[]>(KEY);
      if (stored?.length) return stored;
    } catch (e) {
      console.warn('Vercel KV read failed, falling back to local storage:', e);
    }
  }

  if (memoryStore && memoryStore.length > 0) {
    return memoryStore;
  }

  const fileData = await readFromFile();
  if (fileData) {
    memoryStore = fileData;
    return fileData;
  }

  memoryStore = [...initialMenu];
  return memoryStore;
}

export async function writeMenu(menu: MenuItem[]) {
  memoryStore = menu;
  await writeToFile(menu);

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.set(KEY, menu);
    } catch (e) {
      console.warn('Vercel KV write failed:', e);
    }
  }
}

export async function readSettings(): Promise<CafeSettings> {
  const defaultSettings: CafeSettings = {
    storeOpen: true,
    adminPasscode: process.env.ADMIN_PASSWORD || '1234',
    paymentSettings: defaultPaymentSettings,
  };

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const stored = await kv.get<CafeSettings>(SETTINGS_KEY);
      if (stored && typeof stored.storeOpen === 'boolean') {
        return {
          storeOpen: stored.storeOpen,
          adminPasscode: stored.adminPasscode || defaultSettings.adminPasscode,
          paymentSettings: stored.paymentSettings || defaultPaymentSettings,
        };
      }
    } catch {}
  }

  if (memorySettings) {
    return memorySettings;
  }

  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.storeOpen === 'boolean') {
      memorySettings = {
        storeOpen: parsed.storeOpen,
        adminPasscode: parsed.adminPasscode || defaultSettings.adminPasscode,
        paymentSettings: parsed.paymentSettings || defaultPaymentSettings,
      };
      return memorySettings;
    }
  } catch {}

  memorySettings = defaultSettings;
  return memorySettings;
}

export async function writeSettings(settings: CafeSettings) {
  memorySettings = settings;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write settings file:', err);
  }

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.set(SETTINGS_KEY, settings);
    } catch {}
  }
}
