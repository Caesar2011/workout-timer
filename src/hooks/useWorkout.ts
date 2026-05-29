import { useEffect, useRef, useState } from 'preact/hooks';

import {
  playActive,
  playCountdownBeep,
  playDone,
  playRest,
  playStart,
} from '../logic/sound';
import {
  add30 as add30Fn,
  buildInitialWorkoutState,
  forward as forwardFn,
  rewind as rewindFn,
  tick,
} from '../logic/workout';
import type { PhaseKind, WorkoutConfig, WorkoutState } from '../types';

interface UseWorkoutReturn {
  state: WorkoutState;
  countdownRemaining: number | null;
  paused: boolean;
  pause: () => void;
  resume: () => void;
  rewind: () => void;
  forward: () => void;
  add30: () => void;
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
  const [paused, setPaused] = useState(false);

  const prevPhaseRef = useRef<PhaseKind | null>(null);
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

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

    if (soundRef.current) playStart();
    setCountdownRemaining(null);
  }, [countdownRemaining]);

  useEffect(() => {
    if (countdownRemaining !== null) return;
    if (state.phase === 'done') return;

    const id = setInterval(() => {
      if (pausedRef.current) return;

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

  useEffect(() => {
    prevPhaseRef.current = state.phase;
  }, [state.phase]);

  function pause() {
    setPaused(true);
  }
  function resume() {
    setPaused(false);
  }
  function rewind() {
    setState((prev) => rewindFn(prev, config));
  }
  function forward() {
    setState((prev) => forwardFn(prev, config));
  }
  function add30() {
    setState((prev) => add30Fn(prev, config));
  }

  return {
    state,
    countdownRemaining,
    paused,
    pause,
    resume,
    rewind,
    forward,
    add30,
  };
}
