import { useState } from "preact/hooks";
import { Numpad } from "../../Numpad/Numpad";
import styles from "./DurationInput.module.css";

interface Props {
  label: string;
  value: number;
  onChange: (secs: number) => void;
  color: "active" | "rest";
}

function secsToMins(secs: number): { m: number; s: number } {
  return { m: Math.floor(secs / 60), s: secs % 60 };
}

type Field = "min" | "sec";

export function DurationInput({ label, value, onChange, color }: Props) {
  const [activeField, setActiveField] = useState<Field | null>(null);
  const { m, s } = secsToMins(value);

  function handleNumpad(val: number) {
    if (activeField === "min") {
      // Replace minutes, keep current seconds
      onChange(Math.min(val, 99) * 60 + s);
    } else {
      // Allow any second value — carry overflow into minutes automatically
      const totalSecs = m * 60 + val;
      onChange(totalSecs);
    }
  }

  const accentClass = color === "active" ? styles.accentActive : styles.accentRest;

  return (
    <div class={styles.wrapper}>
      <span class={styles.label}>{label}</span>
      <div class={styles.fields}>
        <button
          class={`${styles.field} ${accentClass} ${activeField === "min" ? styles.fieldFocused : ""}`}
          onClick={() => setActiveField(activeField === "min" ? null : "min")}
        >
          <span class={styles.fieldValue}>{m.toString().padStart(2, "0")}</span>
          <span class={styles.fieldUnit}>min</span>
        </button>
        <span class={styles.colon}>:</span>
        <button
          class={`${styles.field} ${accentClass} ${activeField === "sec" ? styles.fieldFocused : ""}`}
          onClick={() => setActiveField(activeField === "sec" ? null : "sec")}
        >
          <span class={styles.fieldValue}>{s.toString().padStart(2, "0")}</span>
          <span class={styles.fieldUnit}>sec</span>
        </button>
      </div>
      {activeField !== null && (
        <Numpad
          value={activeField === "min" ? m : s}
          // No upper cap on seconds — overflow carries into minutes
          max={activeField === "min" ? 99 : 9999}
          onChange={handleNumpad}
          onClose={() => setActiveField(null)}
        />
      )}
    </div>
  );
}