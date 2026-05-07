import { useAppContext } from '../../../contexts/useAppContext';
import type { WorkoutConfig } from '../../../types';
import {
  formatTime,
  formatTotalDuration,
  getTotalDuration,
} from '../../../logic/workout';

import styles from './HistoryList.module.css';

interface Props {
  onSelect: (cfg: WorkoutConfig) => void;
}

export function HistoryList({ onSelect }: Props) {
  const { history } = useAppContext();

  return (
    <div class={styles.list}>
      <h2 class={styles.heading}>Recent</h2>
      {history.length === 0 && <p class={styles.empty}>No history yet.</p>}
      {history.map((cfg, i) => {
        const total = getTotalDuration(cfg);
        return (
          <button key={i} class={styles.item} onClick={() => onSelect(cfg)}>
            <div class={styles.times}>
              <span class={styles.active}>{formatTime(cfg.activeSecs)}</span>
              <span class={styles.sep}>/</span>
              <span class={styles.rest}>{formatTime(cfg.restSecs)}</span>
            </div>
            <div class={styles.meta}>
              <span class={styles.rounds}>{cfg.rounds} rds</span>
              <span class={styles.total}>{formatTotalDuration(total)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
