import { ROAST_STYLES } from "@/types";
import type { RoastStyle } from "@/types";

const STORAGE_KEY = "roast_history";
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  id: string;
  resume_name: string;
  style: string;
  overall_score: number;
  summary: string;
  created_at: string;
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: HistoryEntry): void {
  try {
    const history = getHistory();
    if (history.some((h) => h.id === entry.id)) return;
    history.unshift(entry);
    if (history.length > MAX_ENTRIES) history.length = MAX_ENTRIES;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function removeFromHistory(id: string): void {
  try {
    const history = getHistory().filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getStyleLabel(style: RoastStyle | string): string {
  const found = ROAST_STYLES.find((s) => s.value === style);
  return found ? `${found.emoji} ${found.label}` : style;
}