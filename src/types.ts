export type PhaseKind = "active" | "rest" | "countdown" | "done";

export type TimerDirection = "up" | "down";

export interface WorkoutConfig {
  activeSecs: number;
  restSecs: number;
  rounds: number;
  countdownSecs: number;
  direction: TimerDirection;
  /** ISO timestamp — when this config was last used */
  usedAt: string;
}

export interface DisplaySettings {
  showTotalTime: boolean;
  showRoundNumber: boolean;
  soundEnabled: boolean;
}

export interface AppSettings extends DisplaySettings {
  countdownSecs: number;
  direction: TimerDirection;
}

export interface WorkoutState {
  phase: PhaseKind;
  /** 1-based */
  round: number;
  phaseRemaining: number;
  totalElapsed: number;
  totalDuration: number;
}

export interface DonutSegment {
  kind: "active" | "rest";
  /** 0–360 degrees, start angle from top (12 o'clock) */
  startAngle: number;
  /** arc length in degrees */
  sweepAngle: number;
}