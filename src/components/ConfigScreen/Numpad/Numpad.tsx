import { useState } from 'preact/hooks';

import styles from './Numpad.module.css';

interface Props {
  /** Current committed value — shown before first keypress, then replaced. */
  value: number;
  min?: number;
  max: number;
  onChange: (v: number) => void;
  onClose: () => void;
}

const KEYS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '⌫',
  '0',
  '✓',
] as const;

export function Numpad({ min = 0, max, onChange, onClose }: Props) {
  // Start at 0 so user types a fresh value immediately
  const [draft, setDraft] = useState(0);

  function handleKey(key: string) {
    if (key === '✓') {
      onChange(Math.max(min, draft));
      onClose();
      return;
    }
    if (key === '⌫') {
      setDraft((n) => Math.max(0, Math.floor(n / 10)));
      return;
    }
    const next = draft * 10 + parseInt(key, 10);
    if (next <= max) setDraft(next);
  }

  return (
    <div
      class={styles.overlay}
      onClick={() => {
        onChange(Math.max(min, draft));
        onClose();
      }}
    >
      <div class={styles.pad} onClick={(e) => e.stopPropagation()}>
        <div class={styles.display}>{draft}</div>
        <div class={styles.grid}>
          {KEYS.map((k) => (
            <button
              key={k}
              class={`${styles.key} ${k === '✓' ? styles.confirm : ''} ${k === '⌫' ? styles.back : ''}`}
              onClick={() => handleKey(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
