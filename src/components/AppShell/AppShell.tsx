import { useAppContext } from "../../contexts/useAppContext";
import { ConfigScreen } from "../ConfigScreen/ConfigScreen";
import { WorkoutScreen } from "../WorkoutScreen/WorkoutScreen";
import styles from "./AppShell.module.css";

export function AppShell() {
  const { activeConfig } = useAppContext();

  return (
    <div class={styles.shell}>
      {activeConfig ? <WorkoutScreen config={activeConfig} /> : <ConfigScreen />}
    </div>
  );
}