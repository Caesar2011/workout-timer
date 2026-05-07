import { useEffect, useRef, useState } from 'preact/hooks';

import {
  playActive,
  playCountdownBeep,
  playDone,
  playRest,
  playStart,
} from '../logic/sound';
import { buildInitialWorkoutState, tick } from '../logic/workout';
import type { PhaseKind, WorkoutConfig, WorkoutState } from '../types';

interface UseWorkoutReturn {
  state: WorkoutState;
  countdownRemaining: number | null;
}

export function useWorkout(
  config: WorkoutConfig,
  soundEnabled: boolean,
): UseWorkoutReturn {
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(
    config.countdownSecs > 0 ? config.countdownSecs : null,
  );
  const [state, setState] = useState<WorkoutState>(
    buildInitialWorkoutState(config),
  );

  const prevPhaseRef = useRef<PhaseKind | null>(null);
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;

  useEffect(() => {
    if (countdownRemaining === null) return;

    if (countdownRemaining > 0) {
      if (soundRef.current) playCountdownBeep();
      const id = setTimeout(
        () => setCountdownRemaining((n) => (n !== null ? n - 1 : null)),
        1000,
      );
      return () => clearTimeout(id);
    }

    // countdown hit 0 → start
    if (soundRef.current) playStart();
    setCountdownRemaining(null);
  }, [countdownRemaining]);

  useEffect(() => {
    if (countdownRemaining !== null) return;
    if (state.phase === 'done') return;

    const id = setInterval(() => {
      setState((prev) => {
        const next = tick(prev, config);

        if (soundRef.current && next.phase !== prev.phase) {
          if (next.phase === 'active') playActive();
          else if (next.phase === 'rest') playRest();
          else if (next.phase === 'done') playDone();
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [countdownRemaining, state.phase, config]);

  // fire sound on phase change (tracked separately to avoid double-fire)
  useEffect(() => {
    prevPhaseRef.current = state.phase;
  }, [state.phase]);

  return { state, countdownRemaining };
}
