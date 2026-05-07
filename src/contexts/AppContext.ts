import { createContext } from 'preact';

import { DEFAULT_SETTINGS } from '../config';
import type { AppSettings, WorkoutConfig } from '../types';

export interface AppContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  history: WorkoutConfig[];
  addToHistory: (config: WorkoutConfig) => void;
  activeConfig: WorkoutConfig | null;
  startWorkout: (config: WorkoutConfig) => void;
  returnToConfig: () => void;
}

export const AppContext = createContext<AppContextValue>({
  settings: { ...DEFAULT_SETTINGS },
  updateSettings: () => undefined,
  history: [],
  addToHistory: () => undefined,
  activeConfig: null,
  startWorkout: () => undefined,
  returnToConfig: () => undefined,
});
