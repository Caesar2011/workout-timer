import { useState } from "preact/hooks";
import { useAppContext } from "../../../contexts/useAppContext";
import { Numpad } from "../Numpad/Numpad";
import styles from "./SettingsPanel.module.css";

export function SettingsPanel() {
  const { settings, updateSettings } = useAppContext();
  const [countdownOpen, setCountdownOpen] = useState(false);

  return (
    <div class={styles.panel}>
      <h2 class={styles.heading}>Settings</h2>

      <div class={styles.row}>
        <span>Show total time</span>
        <Toggle value={settings.showTotalTime} onChange={(v) => updateSettings({ showTotalTime: v })} />
      </div>

      <div class={styles.row}>
        <span>Show round number</span>
        <Toggle value={settings.showRoundNumber} onChange={(v) => updateSettings({ showRoundNumber: v })} />
      </div>

      <div class={styles.row}>
        <span>Sound</span>
        <Toggle value={settings.soundEnabled} onChange={(v) => updateSettings({ soundEnabled: v })} />
      </div>

      <div class={styles.row}>
        <span>Count direction</span>
        <div class={styles.segmented}>
          <button
            class={`${styles.seg} ${settings.direction === "down" ? styles.segActive : ""}`}
            onClick={() => updateSettings({ direction: "down" })}
          >
            Down
          </button>
          <button
            class={`${styles.seg} ${settings.direction === "up" ? styles.segActive : ""}`}
            onClick={() => updateSettings({ direction: "up" })}
          >
            Up
          </button>
        </div>
      </div>

      <div class={styles.row}>
        <span>Pre-countdown (sec)</span>
        <button class={styles.numField} onClick={() => setCountdownOpen((o) => !o)}>
          {settings.countdownSecs}
        </button>
        {countdownOpen && (
          <Numpad
            value={settings.countdownSecs}
            min={0}
            max={10}
            onChange={(v) => updateSettings({ countdownSecs: v })}
            onClose={() => setCountdownOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button class={`${styles.toggle} ${value ? styles.toggleOn : ""}`} onClick={() => onChange(!value)}>
      <span class={styles.toggleKnob} />
    </button>
  );
}