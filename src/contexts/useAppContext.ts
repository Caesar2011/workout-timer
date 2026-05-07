import { useContext } from "preact/hooks";
import { AppContext } from "./AppContext";

export function useAppContext() {
  return useContext(AppContext);
}