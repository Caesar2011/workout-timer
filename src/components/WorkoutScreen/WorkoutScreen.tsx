import { useEffect, useRef, useState } from 'preact/hooks';

import { useAppContext } from '../../contexts/useAppContext';
import { useWorkout } from '../../hooks/useWorkout';
import type { WorkoutConfig } from '../../types';
import { formatTime, getDonutSegments } from '../../logic/workout';

import { DonutRing } from './DonutRing/DonutRing';
import { CountdownOverlay } from './CountdownOverlay/CountdownOverlay';
import styles from './WorkoutScreen.module.css';

interface Props {
  config: WorkoutConfig;
}

const HIDE_DELAY_MS = 10_000;

export function WorkoutScreen({ config }: Props) {
  const { settings, returnToConfig } = useAppContext();
  const { state, countdownRemaining } = useWorkout(config, settings.soundEnabled);
  const segments = getDonutSegments(config);

  const [backVisible, setBackVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetHideTimer() {
    setBackVisible(true);
    if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setBackVisible(false), HIDE_DELAY_MS);
  }

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const isDone = state.phase === 'done';
  const isActive = state.phase === 'active';
  const phaseColor = isDone
    ? 'var(--c-active)'
    : isActive
      ? 'var(--c-active)'
      : 'var(--c-rest)';

  const displayTotal =
    settings.direction === 'down'
      ? state.totalDuration - state.totalElapsed
      : state.totalElapsed;

  const totalLabel =
    settings.direction === 'down' ? 'TOTAL REMAINING' : 'TOTAL ELAPSED';

  return (
    <div
      class={styles.screen}
      style={{ '--phase-color': phaseColor } as Record<string, string>}
      onClick={resetHideTimer}
    >
      {countdownRemaining !== null && (
        <CountdownOverlay remaining={countdownRemaining} />
      )}

      {settings.showRoundNumber && !isDone && (
        <div class={styles.cornerTL}>
          <span class={styles.cornerLabel}>ROUND</span>
          <span class={styles.cornerValue}>
            {state.round} / {config.rounds}
          </span>
        </div>
      )}

      {settings.showTotalTime && (
        <div class={styles.cornerTR}>
          <span class={styles.cornerLabel}>{totalLabel}</span>
          <span class={`${styles.cornerValue}`}>
            {formatTime(displayTotal)}
          </span>
        </div>
      )}

      <div class={styles.center}>
        <DonutRing
          segments={segments}
          totalSecs={state.totalDuration}
          elapsedSecs={state.totalElapsed}
          phase={state.phase}
        />
        <div class={styles.labels}>
          {isDone ? (
            <span class={styles.doneText}>Done!</span>
          ) : (
            <span class={styles.phaseTime} style={{ color: phaseColor }}>
              {formatTime(state.phaseRemaining)}
            </span>
          )}
        </div>
      </div>

      <button
        class={`pill-btn pill-btn--ghost ${styles.backBtn} ${backVisible ? styles.backVisible : styles.backHidden}`}
        onClick={(e) => {
          e.stopPropagation();
          returnToConfig();
        }}
      >
        ← Back
      </button>
    </div>
  );
}