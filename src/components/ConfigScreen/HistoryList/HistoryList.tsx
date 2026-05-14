import { useAppContext } from '../../../contexts/useAppContext';
import type { WorkoutConfig } from '../../../types';
import { formatTotalDuration, getTotalDuration } from '../../../logic/workout';

import styles from './HistoryList.module.css';

interface Props {
  onSelect: (cfg: WorkoutConfig) => void;
}

export function HistoryList({ onSelect }: Props) {
  const { history } = useAppContext();
  if (history.length === 0) return null;

  return (
    <div class={styles.strip}>
      <span class={styles.label}>RECENT CONFIGS</span>
      <div class={styles.scroll}>
        {history.map((cfg, i) => {
          const total = getTotalDuration(cfg);
          const fmtSecs = (s: number) => {
            const m = Math.floor(s / 60).toString().padStart(2, '0');
            const sec = (s % 60).toString().padStart(2, '0');
            return `${m}:${sec}`;
          };
          return (
            <button key={i} class={styles.card} onClick={() => onSelect(cfg)}>
              <div class={styles.cardTop}>
                <span class={styles.act}>ACT {fmtSecs(cfg.activeSecs)}</span>
                <span class={styles.rst}>RST {fmtSecs(cfg.restSecs)}</span>
              </div>
              <div class={styles.cardBot}>
                <span class={styles.rds}>RDS: {cfg.rounds}</span>
                <span class={styles.dur}>{formatTotalDuration(total)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}