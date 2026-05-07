import styles from './CountdownOverlay.module.css';

interface Props {
  remaining: number;
}

export function CountdownOverlay({ remaining }: Props) {
  return (
    <div class={styles.overlay}>
      <span class={styles.number}>{remaining === 0 ? 'GO' : remaining}</span>
    </div>
  );
}
