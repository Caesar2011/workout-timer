import { useEffect, useState } from 'preact/hooks';

import { useAppContext } from '../../contexts/useAppContext';
import { getTotalDuration, formatTotalDuration } from '../../logic/workout';
import type { WorkoutConfig } from '../../types';

import { HistoryList } from './HistoryList/HistoryList';
import { SettingsPanel } from './SettingsPanel/SettingsPanel';
import { WorkoutForm } from './WorkoutForm/WorkoutForm';
import styles from './ConfigScreen.module.css';

export function ConfigScreen() {
  const { settings, startWorkout } = useAppContext();
  const [activeSecs, setActiveSecs] = useState(30);
  const [restSecs, setRestSecs] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [isFullscreen, setIsFullscreen] = useState(
    () => !!document.fullscreenElement,
  );

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  function loadConfig(cfg: WorkoutConfig) {
    setActiveSecs(cfg.activeSecs);
    setRestSecs(cfg.restSecs);
    setRounds(cfg.rounds);
  }

  function handleStart() {
    startWorkout({
      activeSecs,
      restSecs,
      rounds,
      countdownSecs: settings.countdownSecs,
      direction: settings.direction,
      usedAt: new Date().toISOString(),
    });
  }

  const canStart = rounds > 0 && activeSecs > 0;
  const totalSecs = canStart
    ? getTotalDuration({
        activeSecs,
        restSecs,
        rounds,
        countdownSecs: 0,
        direction: 'down',
        usedAt: '',
      })
    : 0;

  return (
    <div class={styles.screen}>
      <div class={styles.main}>
        <div class={styles.titleRow}>
          <h1 class={styles.title}>Workout Timer</h1>
          {isFullscreen && (
            <button
              class={`pill-btn pill-btn--ghost ${styles.exitFsBtn}`}
              onClick={() => document.exitFullscreen()}
            >
              ⛶ Exit Fullscreen
            </button>
          )}
        </div>
        <WorkoutForm
          activeSecs={activeSecs}
          restSecs={restSecs}
          rounds={rounds}
          onActiveSecs={setActiveSecs}
          onRestSecs={setRestSecs}
          onRounds={setRounds}
        />
        {canStart && (
          <p class={styles.totalDuration}>
            Total workout: <strong>{formatTotalDuration(totalSecs)}</strong>
          </p>
        )}
        <SettingsPanel />
        <button
          class={`pill-btn pill-btn--primary ${styles.startBtn}`}
          onClick={handleStart}
          disabled={!canStart}
        >
          Start
        </button>
      </div>
      <aside class={styles.sidebar}>
        <HistoryList onSelect={loadConfig} />
      </aside>
    </div>
  );
}