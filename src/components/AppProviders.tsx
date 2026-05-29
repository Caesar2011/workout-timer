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
    // Enter fullscreen; ignore rejections (e.g. called outside user gesture in some browsers)
    document.documentElement.requestFullscreen().catch(() => undefined);
  }

  function returnToConfig() {
    setActiveConfig(null);
    // Stay in fullscreen — user exits via the config screen button
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
