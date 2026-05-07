import { describe, expect, it } from 'vitest';

import type { WorkoutConfig } from '../types';

import {
  buildInitialWorkoutState,
  formatTime,
  getDonutSegments,
  getTotalDuration,
  tick,
} from './workout';

const cfg: WorkoutConfig = {
  activeSecs: 30,
  restSecs: 10,
  rounds: 3,
  countdownSecs: 3,
  direction: 'down',
  usedAt: '',
};

describe('getTotalDuration', () => {
  it('excludes final rest', () => {
    expect(getTotalDuration(cfg)).toBe(30 * 3 + 10 * 2);
  });
});

describe('tick', () => {
  it('decrements phaseRemaining', () => {
    const s = buildInitialWorkoutState(cfg);
    expect(tick(s, cfg).phaseRemaining).toBe(29);
  });

  it('transitions active → rest', () => {
    const s = { ...buildInitialWorkoutState(cfg), phaseRemaining: 1 };
    expect(tick(s, cfg).phase).toBe('rest');
  });

  it('transitions rest → active next round', () => {
    const s = buildInitialWorkoutState(cfg);
    const atRest = { ...s, phase: 'rest' as const, phaseRemaining: 1 };
    const next = tick(atRest, cfg);
    expect(next.phase).toBe('active');
    expect(next.round).toBe(2);
  });

  it('ends on last round active expiry', () => {
    const s = {
      ...buildInitialWorkoutState(cfg),
      round: 3,
      phaseRemaining: 1,
    };
    expect(tick(s, cfg).phase).toBe('done');
  });
});

describe('getDonutSegments', () => {
  it('last round has no rest segment', () => {
    const segs = getDonutSegments(cfg);
    expect(segs[segs.length - 1].kind).toBe('active');
  });

  it('total sweep ≈ 360', () => {
    const total = getDonutSegments(cfg).reduce((a, s) => a + s.sweepAngle, 0);
    expect(total).toBeCloseTo(360);
  });
});

describe('formatTime', () => {
  it('formats correctly', () => {
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(5)).toBe('0:05');
  });
});
