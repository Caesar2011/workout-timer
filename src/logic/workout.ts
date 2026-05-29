import type {
  DonutSegment,
  SegmentAdjustment,
  WorkoutConfig,
  WorkoutState,
} from '../types';

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
    const segIdx = segmentIndex(state.round, 'rest');
    const restDuration = getSegmentDuration(
      segIdx,
      config,
      state.segmentAdjustments,
    );
    return {
      ...state,
      phase: 'rest',
      phaseRemaining: restDuration,
      totalElapsed: nextElapsed,
    };
  }

  const segIdx = segmentIndex(state.round + 1, 'active');
  const activeDuration = getSegmentDuration(
    segIdx,
    config,
    state.segmentAdjustments,
  );
  return {
    ...state,
    phase: 'active',
    round: state.round + 1,
    phaseRemaining: activeDuration,
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
    segmentAdjustments: [],
  };
}

// ── Segment helpers ────────────────────────────────────

function segmentIndex(round: number, phase: 'active' | 'rest'): number {
  return (round - 1) * 2 + (phase === 'rest' ? 1 : 0);
}

export function getCurrentSegmentIndex(state: WorkoutState): number {
  if (state.phase === 'active') return segmentIndex(state.round, 'active');
  return segmentIndex(state.round, 'rest');
}

function getSegmentDurations(
  config: WorkoutConfig,
  adjustments: SegmentAdjustment[],
): { kind: 'active' | 'rest'; duration: number }[] {
  const segs: { kind: 'active' | 'rest'; duration: number }[] = [];
  for (let r = 1; r <= config.rounds; r++) {
    segs.push({ kind: 'active', duration: config.activeSecs });
    if (r < config.rounds) {
      segs.push({ kind: 'rest', duration: config.restSecs });
    }
  }
  for (const adj of adjustments) {
    if (adj.segmentIndex >= 0 && adj.segmentIndex < segs.length) {
      segs[adj.segmentIndex].duration += adj.extraSecs;
    }
  }
  return segs;
}

function getSegmentDuration(
  segmentIndex: number,
  config: WorkoutConfig,
  adjustments: SegmentAdjustment[],
): number {
  const durations = getSegmentDurations(config, adjustments);
  return durations[segmentIndex]?.duration ?? 0;
}

function getSegmentStartElapsed(
  segmentIndex: number,
  config: WorkoutConfig,
  adjustments: SegmentAdjustment[],
): number {
  const durations = getSegmentDurations(config, adjustments);
  let elapsed = 0;
  for (let i = 0; i < segmentIndex; i++) {
    elapsed += durations[i].duration;
  }
  return elapsed;
}

/** Rewind: go to start of current segment, or previous segment if <2s into this one. */
export function rewind(
  state: WorkoutState,
  config: WorkoutConfig,
): WorkoutState {
  if (state.phase === 'done') return state;

  const segIdx = getCurrentSegmentIndex(state);
  const segStart = getSegmentStartElapsed(
    segIdx,
    config,
    state.segmentAdjustments,
  );
  const elapsedInSeg = state.totalElapsed - segStart;

  if (elapsedInSeg < 2) {
    if (segIdx === 0) return state;
    const prevStart = getSegmentStartElapsed(
      segIdx - 1,
      config,
      state.segmentAdjustments,
    );
    const prevDuration = getSegmentDuration(
      segIdx - 1,
      config,
      state.segmentAdjustments,
    );
    const prevRound = Math.floor((segIdx - 1) / 2) + 1;
    const prevPhase: 'active' | 'rest' =
      (segIdx - 1) % 2 === 0 ? 'active' : 'rest';
    return {
      ...state,
      round: prevRound,
      phase: prevPhase,
      phaseRemaining: prevDuration,
      totalElapsed: prevStart,
    };
  }

  const segDuration = getSegmentDuration(
    segIdx,
    config,
    state.segmentAdjustments,
  );
  return {
    ...state,
    phaseRemaining: segDuration,
    totalElapsed: segStart,
  };
}

/** Forward: jump to start of next segment (or done if last). */
export function forward(
  state: WorkoutState,
  config: WorkoutConfig,
): WorkoutState {
  if (state.phase === 'done') return state;

  const segIdx = getCurrentSegmentIndex(state);
  const totalSegments = config.rounds * 2 - 1;

  if (segIdx >= totalSegments - 1) {
    const segStart = getSegmentStartElapsed(
      segIdx,
      config,
      state.segmentAdjustments,
    );
    const segDuration = getSegmentDuration(
      segIdx,
      config,
      state.segmentAdjustments,
    );
    return {
      ...state,
      phase: 'done',
      phaseRemaining: 0,
      totalElapsed: segStart + segDuration,
    };
  }

  const nextStart = getSegmentStartElapsed(
    segIdx + 1,
    config,
    state.segmentAdjustments,
  );
  const nextDuration = getSegmentDuration(
    segIdx + 1,
    config,
    state.segmentAdjustments,
  );
  const nextRound = Math.floor((segIdx + 1) / 2) + 1;
  const nextPhase: 'active' | 'rest' =
    (segIdx + 1) % 2 === 0 ? 'active' : 'rest';
  return {
    ...state,
    round: nextRound,
    phase: nextPhase,
    phaseRemaining: nextDuration,
    totalElapsed: nextStart,
  };
}

/** Add 30 seconds to current segment. */
export function add30(
  state: WorkoutState,
  _config: WorkoutConfig,
): WorkoutState {
  if (state.phase === 'done') return state;

  const segIdx = getCurrentSegmentIndex(state);
  const adjustments = state.segmentAdjustments.slice();
  const existing = adjustments.find((a) => a.segmentIndex === segIdx);
  if (existing) {
    existing.extraSecs += 30;
  } else {
    adjustments.push({ segmentIndex: segIdx, extraSecs: 30 });
  }

  return {
    ...state,
    phaseRemaining: state.phaseRemaining + 30,
    totalDuration: state.totalDuration + 30,
    segmentAdjustments: adjustments,
  };
}

export function getDonutSegments(
  config: WorkoutConfig,
  adjustments: SegmentAdjustment[],
): DonutSegment[] {
  const durations = getSegmentDurations(config, adjustments);
  const total = durations.reduce((sum, s) => sum + s.duration, 0);
  if (total === 0) return [];

  const segments: DonutSegment[] = [];
  let angle = 0;

  for (const seg of durations) {
    const sweep = (seg.duration / total) * 360;
    segments.push({
      kind: seg.kind,
      startAngle: angle,
      sweepAngle: sweep,
    });
    angle += sweep;
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
