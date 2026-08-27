import { useSyncExternalStore } from "react";

/** DEV-only Final Ending preview. Production always returns false. */
export const PREVIEW_FAVORITE_FALLBACK = "星空";

const PREVIEW_URL_EVENT = "final-preview-url";

/**
 * Visual-only ending shortcut. Requires BOTH:
 * - import.meta.env.DEV
 * - ?preview=final
 * Never writes GameContext. Production builds DCE to `false`.
 */
export function isFinalPreview(): boolean {
  if (!import.meta.env.DEV) return false;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "final";
}

/**
 * SSR-safe read of isFinalPreview. Server snapshot is always false so
 * hydration matches; the client then picks up ?preview=final after hydrate.
 */
export function useIsFinalPreview(): boolean {
  return useSyncExternalStore(subscribePreviewUrl, isFinalPreview, () => false);
}

function subscribePreviewUrl(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener(PREVIEW_URL_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener(PREVIEW_URL_EVENT, onStoreChange);
  };
}

/** Drop ?preview=final without reloading. Does not touch GameContext. */
export function exitFinalPreviewUrl() {
  if (!import.meta.env.DEV) return;
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (url.searchParams.get("preview") !== "final") return;
  url.searchParams.delete("preview");
  const qs = url.searchParams.toString();
  window.history.replaceState(null, "", `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`);
  window.dispatchEvent(new Event(PREVIEW_URL_EVENT));
}
