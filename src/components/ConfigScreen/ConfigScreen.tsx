import { useEffect, useState } from 'preact/hooks';

import { useAppContext } from '../../contexts/useAppContext';
import { getTotalDuration, formatTotalDuration } from '../../logic/workout';
import type { WorkoutConfig } from '../../types';

import { Numpad } from './Numpad/Numpad';
import { HistoryList } from './HistoryList/HistoryList';
import styles from './ConfigScreen.module.css';

export function ConfigScreen() {
  const { settings, updateSettings, startWorkout } = useAppContext();
  const [activeSecs, setActiveSecs] = useState(30);
  const [restSecs, setRestSecs] = useState(10);
  const [rounds, setRounds] = useState(8);

  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  type NumpadTarget = 'activeMin' | 'activeSec' | 'restMin' | 'restSec' | 'rounds' | 'countdown';
  const [numpadTarget, setNumpadTarget] = useState<NumpadTarget | null>(null);

  function openNumpad(target: NumpadTarget) { setNumpadTarget(target); }
  function closeNumpad() { setNumpadTarget(null); }

  function handleNumpadChange(val: number) {
    switch (numpadTarget) {
      case 'activeMin': setActiveSecs(val * 60 + (activeSecs % 60)); break;
      case 'activeSec': setActiveSecs(Math.floor(activeSecs / 60) * 60 + val); break;
      case 'restMin':   setRestSecs(val * 60 + (restSecs % 60)); break;
      case 'restSec':   setRestSecs(Math.floor(restSecs / 60) * 60 + val); break;
      case 'rounds':    setRounds(val); break;
      case 'countdown': updateSettings({ countdownSecs: val }); break;
    }
  }

  function numpadProps(): { value: number; max: number } {
    switch (numpadTarget) {
      case 'activeMin': return { value: Math.floor(activeSecs / 60), max: 99 };
      case 'activeSec': return { value: activeSecs % 60, max: 59 };
      case 'restMin':   return { value: Math.floor(restSecs / 60), max: 99 };
      case 'restSec':   return { value: restSecs % 60, max: 59 };
      case 'rounds':    return { value: rounds, max: 99 };
      case 'countdown': return { value: settings.countdownSecs, max: 60 };
      default:          return { value: 0, max: 99 };
    }
  }

  function loadConfig(cfg: WorkoutConfig) {
    setActiveSecs(cfg.activeSecs);
    setRestSecs(cfg.restSecs);
    setRounds(cfg.rounds);
  }

  function handleStart() {
    startWorkout({
      activeSecs, restSecs, rounds,
      countdownSecs: settings.countdownSecs,
      direction: settings.direction,
      usedAt: new Date().toISOString(),
    });
  }

  const canStart = rounds > 0 && activeSecs > 0;
  const totalSecs = canStart
    ? getTotalDuration({ activeSecs, restSecs, rounds, countdownSecs: 0, direction: 'down', usedAt: '' })
    : 0;

  const activeM = Math.floor(activeSecs / 60);
  const activeS = activeSecs % 60;
  const restM   = Math.floor(restSecs / 60);
  const restS   = restSecs % 60;

  function toggleFullscreen() {
    if (isFullscreen) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => undefined);
  }

  return (
    <div class={styles.screen}>
      {/* ── Left column ── */}
      <div class={styles.left}>
        <div class={`${styles.card} ${styles.cardActive}`}>
          <div class={styles.cardHeader}>
            <span class={styles.cardTitle}>ACTIVE TIME</span>
            <svg class={styles.cardIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z" />
            </svg>
          </div>
          <div class={styles.timeRow}>
            <button class={styles.stepBtn} onClick={() => setActiveSecs(Math.max(5, activeSecs - 5))}>−</button>
            <div class={`${styles.timeDisplay} ${styles.timeDisplayActive}`}>
              <button class={styles.timePart} onClick={() => openNumpad('activeMin')}>
                {activeM.toString().padStart(2, '0')}
              </button>
              <span class={styles.timeColon}>:</span>
              <button class={styles.timePart} onClick={() => openNumpad('activeSec')}>
                {activeS.toString().padStart(2, '0')}
              </button>
            </div>
            <button class={styles.stepBtn} onClick={() => setActiveSecs(activeSecs + 5)}>+</button>
          </div>
        </div>

        <div class={`${styles.card} ${styles.cardRest}`}>
          <div class={styles.cardHeader}>
            <span class={styles.cardTitle}>REST TIME</span>
            <svg class={styles.cardIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M2,21V19H20V21H2M20,8V5H18V8H20M20,3A2,2 0 0,1 22,5V8A2,2 0 0,1 20,10H18V13A4,4 0 0,1 14,17H8A4,4 0 0,1 4,13V3H20M16,5H6V13A2,2 0 0,0 8,15H14A2,2 0 0,0 16,13V5Z" />
            </svg>
          </div>
          <div class={styles.timeRow}>
            <button class={styles.stepBtn} onClick={() => setRestSecs(Math.max(0, restSecs - 5))}>−</button>
            <div class={`${styles.timeDisplay} ${styles.timeDisplayRest}`}>
              <button class={styles.timePart} onClick={() => openNumpad('restMin')}>
                {restM.toString().padStart(2, '0')}
              </button>
              <span class={styles.timeColon}>:</span>
              <button class={styles.timePart} onClick={() => openNumpad('restSec')}>
                {restS.toString().padStart(2, '0')}
              </button>
            </div>
            <button class={styles.stepBtn} onClick={() => setRestSecs(restSecs + 5)}>+</button>
          </div>
        </div>
      </div>

      {/* ── Right column ── */}
      <div class={styles.right}>
        {/* Rounds card */}
        <div class={`${styles.card} ${styles.cardRounds}`}>
          <div class={styles.cardHeader}>
            <span class={styles.cardTitle}>TOTAL ROUNDS</span>
            <svg class={styles.cardIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z" />
            </svg>
          </div>
          <div class={styles.timeRow}>
            <button class={styles.stepBtn} onClick={() => setRounds(Math.max(1, rounds - 1))}>−</button>
            <button class={styles.roundsValue} onClick={() => openNumpad('rounds')}>
              {rounds.toString().padStart(1, '0')}
            </button>
            <button class={styles.stepBtn} onClick={() => setRounds(rounds + 1)}>+</button>
          </div>
        </div>

        {/* 4 display-toggle cards */}
        <div class={styles.toggleGrid}>
          <ToggleCard
            active={settings.showRoundNumber}
            onToggle={() => updateSettings({ showRoundNumber: !settings.showRoundNumber })}
            label={settings.showRoundNumber ? "Show Rounds" : "Hide Rounds"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z" />
            </svg>
          </ToggleCard>

          <ToggleCard
            active={settings.showTotalTime}
            onToggle={() => updateSettings({ showTotalTime: !settings.showTotalTime })}
            label={settings.showTotalTime ? "Show Totals" : "Hide Total Time"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d={
                settings.showTotalTime
                  ? "M6,2V8H6V8L10,12L6,16V16H6V22H18V16H18V16L14,12L18,8V8H18V2H6Z"
                    : "M6,2V8H6V8L10,12L6,16V16H6V22H18V16H18V16L14,12L18,8V8H18V2H6M16,16.5V20H8V16.5L12,12.5L16,16.5M12,11.5L8,7.5V4H16V7.5L12,11.5Z"
              } />
            </svg>
          </ToggleCard>

          <ToggleCard
            active={settings.soundEnabled}
            onToggle={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            label={settings.soundEnabled ? "Play Sounds" : "No Sounds"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d={settings.soundEnabled
                ? 'M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z'
                  : "M7,9V15H11L16,20V4L11,9H7Z"
              } />
            </svg>
          </ToggleCard>

          <ToggleCard
            active={settings.direction === 'down'}
            onToggle={() => updateSettings({ direction: settings.direction === 'down' ? 'up' : 'down' })}
            label={settings.direction === 'down' ? 'Count Down' : 'Count Up'}
          >
            {/* direction icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d={settings.direction === 'down'
                ? 'M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z'
                : 'M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z'
              } />
            </svg>
          </ToggleCard>
        </div>

        {/* Settings: prep timer + fullscreen */}
        <div class={styles.settingsCard}>
          <div class={styles.settingRow}>
            <span class={styles.settingLabel}>Prep Timer (sec)</span>
            <div class={styles.prepRow}>
              <button class={styles.stepBtnSm} onClick={() => updateSettings({ countdownSecs: Math.max(0, settings.countdownSecs - 1) })}>−</button>
              <button class={styles.prepValue} onClick={() => openNumpad('countdown')}>
                {settings.countdownSecs.toString().padStart(2, '0')}
              </button>
              <button class={styles.stepBtnSm} onClick={() => updateSettings({ countdownSecs: Math.min(60, settings.countdownSecs + 1) })}>+</button>
            </div>
          </div>

          <button class={styles.settingRowBtn} onClick={toggleFullscreen}>
            <span class={styles.settingLabel}>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
            <svg class={styles.fsIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d={isFullscreen
                ? 'M5,16H8V19H10V14H5V16M8,8H5V10H10V5H8V8M14,19H16V16H19V14H14V19M16,8V5H14V10H19V8H16Z'
                : 'M5,5H10V7H7V10H5V5M19,5V10H17V7H14V5H19M5,19V14H7V17H10V19H5M19,19H14V17H17V14H19V19Z'
              } />
            </svg>
          </button>
        </div>
      </div>

      {/* ── History strip ── */}
      <div class={styles.historyStrip}>
        <HistoryList onSelect={loadConfig} />
      </div>

      {/* ── Start button ── */}
      <button class={styles.startBtn} onClick={handleStart} disabled={!canStart}>
        ▶ START WORKOUT {canStart ? `(${formatTotalDuration(totalSecs)})` : ''}
      </button>

      {numpadTarget !== null && (
        <Numpad
          value={numpadProps().value}
          max={numpadProps().max}
          min={0}
          onChange={handleNumpadChange}
          onClose={closeNumpad}
        />
      )}
    </div>
  );
}

function ToggleCard({
  active,
  onToggle,
  label,
  children,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  children: preact.ComponentChildren;
}) {
  return (
    <button
      class={`${styles.toggleCard} ${active ? styles.toggleCardOn : styles.toggleCardOff}`}
      onClick={onToggle}
    >
      <span class={styles.toggleCardIcon}>{children}</span>
      <span class={styles.toggleCardLabel}>{label}</span>
    </button>
  );
}