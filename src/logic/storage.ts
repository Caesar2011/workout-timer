import {
  DEFAULT_SETTINGS,
  HISTORY_MAX,
  STORAGE_KEY_HISTORY,
  STORAGE_KEY_SETTINGS,
} from '../config';
import type { AppSettings, WorkoutConfig } from '../types';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(raw) as Partial<AppSettings>),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

export function loadHistory(): WorkoutConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkoutConfig[];
  } catch {
    return [];
  }
}

export function saveToHistory(config: WorkoutConfig): void {
  const history = loadHistory();
  const entry: WorkoutConfig = { ...config, usedAt: new Date().toISOString() };
  const deduped = history.filter(
    (h) =>
      h.activeSecs !== entry.activeSecs ||
      h.restSecs !== entry.restSecs ||
      h.rounds !== entry.rounds,
  );
  const next = [entry, ...deduped].slice(0, HISTORY_MAX);
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(next));
}
