let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gainPeak = 0.4,
  startDelay = 0
): void {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ac.currentTime + startDelay);

  gain.gain.setValueAtTime(0, ac.currentTime + startDelay);
  gain.gain.linearRampToValueAtTime(gainPeak, ac.currentTime + startDelay + 0.01);
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + startDelay + duration);

  osc.start(ac.currentTime + startDelay);
  osc.stop(ac.currentTime + startDelay + duration + 0.05);
}

export function playStart(): void {
  // ascending triad
  playTone(440, 0.15, "sine", 0.35, 0);
  playTone(550, 0.15, "sine", 0.35, 0.15);
  playTone(660, 0.25, "sine", 0.4, 0.3);
}

export function playActive(): void {
  // short high double-beep
  playTone(880, 0.1, "square", 0.25, 0);
  playTone(880, 0.1, "square", 0.25, 0.15);
}

export function playRest(): void {
  // single low soft tone
  playTone(330, 0.3, "sine", 0.35, 0);
}

export function playDone(): void {
  // major chord sweep
  playTone(523, 0.4, "sine", 0.3, 0);
  playTone(659, 0.4, "sine", 0.3, 0.1);
  playTone(784, 0.6, "sine", 0.35, 0.2);
}

export function playCountdownBeep(): void {
  playTone(660, 0.08, "square", 0.2, 0);
}