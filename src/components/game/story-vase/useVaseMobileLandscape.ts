import { useSyncExternalStore } from "react";

const QUERY =
  "(orientation: landscape) and (pointer: coarse) and (max-height: 520px)";

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onStoreChange);
  window.addEventListener("resize", onStoreChange);
  return () => {
    mq.removeEventListener("change", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
  };
}

/** Vase Story only. Server / desktop snapshot is always false. */
export function useVaseMobileLandscape() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
