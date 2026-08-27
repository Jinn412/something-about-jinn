import { useEffect, useState, useSyncExternalStore, type SyntheticEvent } from "react";
import "./mobile-orientation-gate.css";

const FADE_MS = 500;
/** Shortest physical screen edge in CSS px. Phones sit well below this; iPads/desktops do not. */
const MOBILE_SHORT_EDGE_MAX = 560;

function readPortraitGate(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const portrait = window.matchMedia("(orientation: portrait)").matches;
  const shortEdge = Math.min(window.screen.width, window.screen.height);
  return coarse && portrait && shortEdge < MOBILE_SHORT_EDGE_MAX;
}

function subscribePortraitGate(onStoreChange: () => void) {
  const coarse = window.matchMedia("(pointer: coarse)");
  const portrait = window.matchMedia("(orientation: portrait)");
  coarse.addEventListener("change", onStoreChange);
  portrait.addEventListener("change", onStoreChange);
  window.addEventListener("orientationchange", onStoreChange);
  window.addEventListener("resize", onStoreChange);
  return () => {
    coarse.removeEventListener("change", onStoreChange);
    portrait.removeEventListener("change", onStoreChange);
    window.removeEventListener("orientationchange", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
  };
}

function usePortraitGate() {
  return useSyncExternalStore(subscribePortraitGate, readPortraitGate, () => false);
}

function blockUnderlyingPlay(event: SyntheticEvent) {
  event.preventDefault();
  event.stopPropagation();
}

/** Portrait-only overlay for coarse, phone-sized screens. Does not touch GameContext. */
export function MobileOrientationGate() {
  const shouldGate = usePortraitGate();
  const [mounted, setMounted] = useState(shouldGate);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (shouldGate) {
      setMounted(true);
      setLeaving(false);
      return;
    }
    if (!mounted) return;
    setLeaving(true);
    const id = window.setTimeout(() => {
      setMounted(false);
      setLeaving(false);
    }, FADE_MS);
    return () => window.clearTimeout(id);
  }, [shouldGate, mounted]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="orient-gate-copy"
      className={`orient-gate${leaving ? " is-leaving" : ""}`}
      onPointerDown={blockUnderlyingPlay}
      onPointerUp={blockUnderlyingPlay}
      onClick={blockUnderlyingPlay}
      onTouchStart={blockUnderlyingPlay}
      onWheel={blockUnderlyingPlay}
      onContextMenu={blockUnderlyingPlay}
    >
      <div className="orient-gate-panel pixel-panel px-6 py-6 text-left text-sm leading-8 md:px-8 md:text-lg md:leading-10">
        <p id="orient-gate-copy">
          嗯……这个视野好像有点窄。
          <br />
          横屏打开的话，没准会发现更多故事。
        </p>
      </div>
      <div className="orient-gate-hint" aria-hidden>
        <div className="orient-phone" />
      </div>
    </div>
  );
}
