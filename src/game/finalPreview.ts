/** DEV-only Final Ending preview. Production always returns false. */
export const PREVIEW_FAVORITE_FALLBACK = "星空";

export function isFinalPreview() {
  if (!import.meta.env.DEV) return false;
  return new URLSearchParams(window.location.search).get("preview") === "final";
}

/** Drop ?preview=final without reloading. Does not touch GameContext. */
export function exitFinalPreviewUrl() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("preview") !== "final") return;
  url.searchParams.delete("preview");
  const qs = url.searchParams.toString();
  window.history.replaceState(null, "", `${url.pathname}${qs ? `?${qs}` : ""}${url.hash}`);
}
