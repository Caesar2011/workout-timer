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
  const {
    state,
    countdownRemaining,
    paused,
    pause,
    resume,
    rewind,
    forward,
    add30,
  } = useWorkout(config, settings.soundEnabled);
  const segments = getDonutSegments(config, state.segmentAdjustments);

  const [backVisible, setBackVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetHideTimer() {
    setBackVisible(true);
    if (hideTimerRef.current !== null) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(
      () => setBackVisible(false),
      HIDE_DELAY_MS,
    );
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

  const panelVisible = backVisible || paused;

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

      <div
        class={`${styles.controlsPanel} ${panelVisible ? styles.controlsVisible : styles.controlsHidden}`}
      >
        <div class={styles.controlsRow}>
          <button class={styles.ctrlBtn} onClick={rewind} title="Rewind">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z" />
            </svg>
          </button>

          <button
            class={`${styles.ctrlPrimary} ${paused ? styles.ctrlPlay : styles.ctrlPause}`}
            onClick={paused ? resume : pause}
            title={paused ? 'Resume' : 'Pause'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d={
                  paused
                    ? 'M8,5.14V19.14L19,12.14L8,5.14Z'
                    : 'M14,19H18V5H14M6,19H10V5H6V19Z'
                }
              />
            </svg>
          </button>

          <button class={styles.ctrlBtn} onClick={forward} title="Forward">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z" />
            </svg>
          </button>
        </div>
        <div class={styles.controlsRow}>
          <button class={`${styles.ctrlCancel} ${styles.ctrlStretch}`} onClick={returnToConfig}>
            Cancel
          </button>
          <button class={`${styles.ctrlAdd} ${styles.ctrlStretch}`} onClick={add30} disabled={isDone}>
            +30s
          </button>
        </div>
      </div>
    </div>
  );
}
