import { DurationInput } from "./DurationInput/DurationInput";
import { NumberInput } from "./NumberInput/NumberInput";
import styles from "./WorkoutForm.module.css";

interface Props {
  activeSecs: number;
  restSecs: number;
  rounds: number;
  onActiveSecs: (v: number) => void;
  onRestSecs: (v: number) => void;
  onRounds: (v: number) => void;
}

export function WorkoutForm({ activeSecs, restSecs, rounds, onActiveSecs, onRestSecs, onRounds }: Props) {
  return (
    <div class={styles.form}>
      <DurationInput label="Active Duration" value={activeSecs} onChange={onActiveSecs} color="active" />
      <DurationInput label="Rest Duration" value={restSecs} onChange={onRestSecs} color="rest" />
      <NumberInput label="Rounds" value={rounds} min={1} max={99} onChange={onRounds} />
    </div>
  );
}