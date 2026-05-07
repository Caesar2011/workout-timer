import "./global.css";
import { AppProviders } from "./components/AppProviders";
import { AppShell } from "./components/AppShell/AppShell";

export function App() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}