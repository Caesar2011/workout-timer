import { useState } from "preact/hooks";
import { Numpad } from "../../Numpad/Numpad";
import styles from "./NumberInput.module.css";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

export function NumberInput({ label, value, min, max, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div class={styles.wrapper}>
      <span class={styles.label}>{label}</span>
      <button
        class={`${styles.field} ${open ? styles.focused : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span class={styles.value}>{value}</span>
      </button>
      {open && (
        <Numpad
          value={value}
          max={max}
          min={0}
          onChange={(v) => onChange(v)}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}