// 本地文件存储（开发环境，替代 Supabase）
// 数据结构：{ resumes: Record<id, Resume>, roasts: Record<id, Roast> }

import fs from "fs";
import path from "path";

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(STORE_DIR, "store.json");

interface Resume {
  id: string;
  file_name: string;
  file_size: number;
  content_text: string;
  storage_path: string | null;
  created_at: string;
}

interface Roast {
  id: string;
  resume_id: string;
  style: string;
  roasts: unknown[];
  overall_score: number;
  summary: string;
  created_at: string;
}

interface StoreData {
  resumes: Record<string, Resume>;
  roasts: Record<string, Roast>;
}

function ensureStore(): StoreData {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    const initial: StoreData = { resumes: {}, roasts: {} };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(STORE_FILE, "utf-8");
  return JSON.parse(raw) as StoreData;
}

function saveStore(data: StoreData): void {
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// ---- 简历操作 ----

export function insertResume(resume: Omit<Resume, "id" | "created_at">): Resume {
  const store = ensureStore();
  const id = generateId();
  const record: Resume = {
    ...resume,
    id,
    created_at: new Date().toISOString(),
  };
  store.resumes[id] = record;
  saveStore(store);
  return record;
}

export function getResume(id: string): Resume | null {
  const store = ensureStore();
  return store.resumes[id] || null;
}

// ---- 吐槽操作 ----

export function insertRoast(roast: Omit<Roast, "id" | "created_at">): Roast {
  const store = ensureStore();
  const id = generateId();
  const record: Roast = {
    ...roast,
    id,
    created_at: new Date().toISOString(),
  };
  store.roasts[id] = record;
  saveStore(store);
  return record;
}

export function getRoast(id: string): Roast | null {
  const store = ensureStore();
  return store.roasts[id] || null;
}

export function deleteRoast(id: string): boolean {
  const store = ensureStore();
  if (!store.roasts[id]) return false;
  delete store.roasts[id];
  saveStore(store);
  return true;
}

export function deleteAllRoasts(): number {
  const store = ensureStore();
  const count = Object.keys(store.roasts).length;
  store.roasts = {};
  saveStore(store);
  return count;
}

// ---- 批量查询 ----

export function getAllRoasts(): Roast[] {
  const store = ensureStore();
  return Object.values(store.roasts).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}