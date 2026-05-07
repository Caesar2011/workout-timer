import type { AppSettings } from "./types";

export const HISTORY_MAX = 10;
export const STORAGE_KEY_SETTINGS = "wt-settings";
export const STORAGE_KEY_HISTORY = "wt-history";

export const DEFAULT_SETTINGS: AppSettings = {
  showTotalTime: true,
  showRoundNumber: true,
  soundEnabled: true,
  countdownSecs: 3,
  direction: "down",
};