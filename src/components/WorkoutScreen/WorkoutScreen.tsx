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

export function WorkoutScreen({ config }: Props) {
  const { settings, returnToConfig } = useAppContext();
  const { state, countdownRemaining } = useWorkout(
    config,
    settings.soundEnabled,
  );
  const segments = getDonutSegments(config);

  const isDone = state.phase === 'done';
  const isActive = state.phase === 'active';
  const phaseColor = isActive ? 'var(--c-active)' : 'var(--c-rest)';

  const displayTotal =
    settings.direction === 'down'
      ? state.totalDuration - state.totalElapsed
      : state.totalElapsed;

  return (
    <div class={styles.screen}>
      {countdownRemaining !== null && (
        <CountdownOverlay remaining={countdownRemaining} />
      )}

      <button
        class={`pill-btn pill-btn--ghost ${styles.backBtn}`}
        onClick={returnToConfig}
      >
        ← Back
      </button>

      <div class={styles.center}>
        <DonutRing
          segments={segments}
          totalSecs={state.totalDuration}
          elapsedSecs={state.totalElapsed}
          phase={state.phase}
        />

        <div class={styles.labels}>
          {settings.showRoundNumber && !isDone && (
            <span class={styles.round}>
              Round {state.round} / {config.rounds}
            </span>
          )}

          {isDone ? (
            <span class={styles.doneText}>Done!</span>
          ) : (
            <span class={styles.phaseTime} style={{ color: phaseColor }}>
              {formatTime(state.phaseRemaining)}
            </span>
          )}

          {settings.showTotalTime && (
            <span class={styles.totalTime}>{formatTime(displayTotal)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
