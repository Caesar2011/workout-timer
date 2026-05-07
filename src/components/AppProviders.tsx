import { useState } from 'preact/hooks';

import {
  loadHistory,
  loadSettings,
  saveSettings,
  saveToHistory,
} from '../logic/storage';
import type { AppSettings, WorkoutConfig } from '../types';
import { AppContext } from '../contexts/AppContext';

export function AppProviders({
  children,
}: {
  children: preact.ComponentChildren;
}) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [history, setHistory] = useState<WorkoutConfig[]>(loadHistory);
  const [activeConfig, setActiveConfig] = useState<WorkoutConfig | null>(null);

  function updateSettings(patch: Partial<AppSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }

  function addToHistory(config: WorkoutConfig) {
    saveToHistory(config);
    setHistory(loadHistory());
  }

  function startWorkout(config: WorkoutConfig) {
    addToHistory(config);
    setActiveConfig(config);
  }

  function returnToConfig() {
    setActiveConfig(null);
  }

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        history,
        addToHistory,
        activeConfig,
        startWorkout,
        returnToConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
