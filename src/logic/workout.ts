import type { DonutSegment, WorkoutConfig, WorkoutState } from '../types';

export function getTotalDuration(config: WorkoutConfig): number {
  return (
    config.rounds * config.activeSecs + (config.rounds - 1) * config.restSecs
  );
}

/** Pure tick: advances state by one second. */
export function tick(state: WorkoutState, config: WorkoutConfig): WorkoutState {
  if (state.phase === 'done' || state.phase === 'countdown') return state;

  const nextRemaining = state.phaseRemaining - 1;
  const nextElapsed = state.totalElapsed + 1;

  if (nextRemaining > 0) {
    return {
      ...state,
      phaseRemaining: nextRemaining,
      totalElapsed: nextElapsed,
    };
  }

  if (state.phase === 'active') {
    const isLastRound = state.round >= config.rounds;
    if (isLastRound) {
      return {
        ...state,
        phase: 'done',
        phaseRemaining: 0,
        totalElapsed: nextElapsed,
      };
    }
    return {
      ...state,
      phase: 'rest',
      phaseRemaining: config.restSecs,
      totalElapsed: nextElapsed,
    };
  }

  return {
    ...state,
    phase: 'active',
    round: state.round + 1,
    phaseRemaining: config.activeSecs,
    totalElapsed: nextElapsed,
  };
}

export function buildInitialWorkoutState(config: WorkoutConfig): WorkoutState {
  return {
    phase: 'active',
    round: 1,
    phaseRemaining: config.activeSecs,
    totalElapsed: 0,
    totalDuration: getTotalDuration(config),
  };
}

export function getDonutSegments(config: WorkoutConfig): DonutSegment[] {
  const total = getTotalDuration(config);
  if (total === 0) return [];

  const segments: DonutSegment[] = [];
  let angle = 0;

  for (let r = 1; r <= config.rounds; r++) {
    const activeSweep = (config.activeSecs / total) * 360;
    segments.push({
      kind: 'active',
      startAngle: angle,
      sweepAngle: activeSweep,
    });
    angle += activeSweep;

    if (r < config.rounds) {
      const restSweep = (config.restSecs / total) * 360;
      segments.push({ kind: 'rest', startAngle: angle, sweepAngle: restSweep });
      angle += restSweep;
    }
  }

  return segments;
}

export function formatTime(secs: number): string {
  const m = Math.floor(Math.abs(secs) / 60);
  const s = Math.abs(secs) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatTotalDuration(secs: number): string {
  if (secs <= 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
