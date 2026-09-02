import type { FinalSequencePhase, GameState } from "./types";

/** Browser localStorage key. Never read/write this at module top-level. */
export const SAVE_GAME_KEY = "something-about-jinn-save";

export type SaveVersion = 1;

export const SAVE_VERSION: SaveVersion = 1;

/**
 * Safe resume points. Title / Setup are not persisted:
 * a run without Character Setup does not need Continue.
 */
export type SaveCheckpoint =
  | "hub"
  | "photo_scene_1"
  | "photo_scene_2"
  | "photo_scene_3"
  | "photo_scene_4"
  | "photo_scene_5"
  | "photo_scene_6"
  | "vase_scene_1"
  | "vase_scene_2"
  | "vase_feedback"
  | "vase_second_tender"
  | "vase_projects"
  | "vase_ability"
  | "telescope_search"
  | "telescope_perspectives"
  | "telescope_late_night"
  | "telescope_future"
  | "telescope_ending"
  | "final_merchant"
  | "final_starfruit"
  | "final_celebration";

export interface SaveGameProgression {
  hasMagnifier: boolean;
  photoStoryComplete: boolean;
  vaseStoryComplete: boolean;
  telescopeStoryComplete: boolean;
  viewedSideItems: string[];
  pendingPhotoMerchantDialogue: boolean;
  pendingVaseMerchantDialogue: boolean;
  pendingTelescopeMerchantDialogue: boolean;
  finalRewardReady: boolean;
  finalSequenceStarted: boolean;
  finalSequenceComplete: boolean;
  finalSequencePhase: FinalSequencePhase;
}

export interface SaveGameState {
  version: SaveVersion;
  playerName: string;
  favoriteThing: string;
  checkpoint: SaveCheckpoint;
  progression: SaveGameProgression;
}

/** Snapshot a live GameState. Hearts / scene / inspectedItems are not stored. */
export function buildSaveGameState(
  gameState: GameState,
  checkpoint: SaveCheckpoint,
): SaveGameState {
  return {
    version: SAVE_VERSION,
    playerName: gameState.playerName,
    favoriteThing: gameState.favoriteThing,
    checkpoint,
    progression: {
      hasMagnifier: gameState.hasMagnifier,
      photoStoryComplete: gameState.photoStoryComplete,
      vaseStoryComplete: gameState.vaseStoryComplete,
      telescopeStoryComplete: gameState.telescopeStoryComplete,
      viewedSideItems: [...gameState.viewedSideItems],
      pendingPhotoMerchantDialogue: gameState.pendingPhotoMerchantDialogue,
      pendingVaseMerchantDialogue: gameState.pendingVaseMerchantDialogue,
      pendingTelescopeMerchantDialogue: gameState.pendingTelescopeMerchantDialogue,
      finalRewardReady: gameState.finalRewardReady,
      finalSequenceStarted: gameState.finalSequenceStarted,
      finalSequenceComplete: gameState.finalSequenceComplete,
      finalSequencePhase: gameState.finalSequencePhase,
    },
  };
}

const SAVE_CHECKPOINTS = new Set<SaveCheckpoint>([
  "hub",
  "photo_scene_1",
  "photo_scene_2",
  "photo_scene_3",
  "photo_scene_4",
  "photo_scene_5",
  "photo_scene_6",
  "vase_scene_1",
  "vase_scene_2",
  "vase_feedback",
  "vase_second_tender",
  "vase_projects",
  "vase_ability",
  "telescope_search",
  "telescope_perspectives",
  "telescope_late_night",
  "telescope_future",
  "telescope_ending",
  "final_merchant",
  "final_starfruit",
  "final_celebration",
]);

/** Mirrors `FinalSequencePhase` in types.ts — keep in sync when that union changes. */
const FINAL_SEQUENCE_PHASES = new Set<FinalSequencePhase>([
  "none",
  "merchant",
  "starfruit",
  "starfruit-ready",
  "eating",
  "taste",
  "celebration",
  "celebration-complete",
  "hold",
  "fade",
  "end-title",
  "complete",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSaveCheckpoint(value: unknown): value is SaveCheckpoint {
  return typeof value === "string" && SAVE_CHECKPOINTS.has(value as SaveCheckpoint);
}

function isFinalSequencePhase(value: unknown): value is FinalSequencePhase {
  return typeof value === "string" && FINAL_SEQUENCE_PHASES.has(value as FinalSequencePhase);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Runtime validator. Rebuilds a plain SaveGameState so extra JSON keys are dropped.
 * Returns null when version, shape, or field types do not match v1.
 */
export function parseSaveGame(value: unknown): SaveGameState | null {
  if (!isObject(value)) return null;
  if (value["version"] !== SAVE_VERSION) return null;
  if (typeof value["playerName"] !== "string") return null;
  if (typeof value["favoriteThing"] !== "string") return null;
  if (!isSaveCheckpoint(value["checkpoint"])) return null;
  if (!isObject(value["progression"])) return null;

  const p = value["progression"];
  if (!isBoolean(p["hasMagnifier"])) return null;
  if (!isBoolean(p["photoStoryComplete"])) return null;
  if (!isBoolean(p["vaseStoryComplete"])) return null;
  if (!isBoolean(p["telescopeStoryComplete"])) return null;
  if (!isStringArray(p["viewedSideItems"])) return null;
  if (!isBoolean(p["pendingPhotoMerchantDialogue"])) return null;
  if (!isBoolean(p["pendingVaseMerchantDialogue"])) return null;
  if (!isBoolean(p["pendingTelescopeMerchantDialogue"])) return null;
  if (!isBoolean(p["finalRewardReady"])) return null;
  if (!isBoolean(p["finalSequenceStarted"])) return null;
  if (!isBoolean(p["finalSequenceComplete"])) return null;
  if (!isFinalSequencePhase(p["finalSequencePhase"])) return null;

  return {
    version: SAVE_VERSION,
    playerName: value["playerName"],
    favoriteThing: value["favoriteThing"],
    checkpoint: value["checkpoint"],
    progression: {
      hasMagnifier: p["hasMagnifier"],
      photoStoryComplete: p["photoStoryComplete"],
      vaseStoryComplete: p["vaseStoryComplete"],
      telescopeStoryComplete: p["telescopeStoryComplete"],
      viewedSideItems: [...p["viewedSideItems"]],
      pendingPhotoMerchantDialogue: p["pendingPhotoMerchantDialogue"],
      pendingVaseMerchantDialogue: p["pendingVaseMerchantDialogue"],
      pendingTelescopeMerchantDialogue: p["pendingTelescopeMerchantDialogue"],
      finalRewardReady: p["finalRewardReady"],
      finalSequenceStarted: p["finalSequenceStarted"],
      finalSequenceComplete: p["finalSequenceComplete"],
      finalSequencePhase: p["finalSequencePhase"],
    },
  };
}

/**
 * Hearts are not stored. Matches GameContext write rules:
 * 10 = finalRewardReady, or all three stories + at least 3 side items
 * 9 = telescope complete
 * 6 = vase complete
 * 3 = photo complete
 * 0 = otherwise
 */
export function deriveHeartsFromSaveProgression(progression: SaveGameProgression): number {
  const allMainStoriesComplete =
    progression.photoStoryComplete &&
    progression.vaseStoryComplete &&
    progression.telescopeStoryComplete;
  const enoughSideItemsViewed = progression.viewedSideItems.length >= 3;

  if (progression.finalRewardReady || (allMainStoriesComplete && enoughSideItemsViewed)) {
    return 10;
  }
  if (progression.telescopeStoryComplete) return 9;
  if (progression.vaseStoryComplete) return 6;
  if (progression.photoStoryComplete) return 3;
  return 0;
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function discardStoredSave(storage: Storage) {
  try {
    storage.removeItem(SAVE_GAME_KEY);
  } catch {
    /* private mode / quota — ignore */
  }
}

/**
 * Read and validate the current save. Never throws.
 * Missing, corrupt, unsupported, or invalid data → null (invalid slots are removed).
 */
export function loadSaveGame(): SaveGameState | null {
  const storage = getLocalStorage();
  if (!storage) return null;

  let raw: string | null;
  try {
    raw = storage.getItem(SAVE_GAME_KEY);
  } catch {
    return null;
  }
  if (raw == null || raw === "") return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    discardStoredSave(storage);
    return null;
  }

  const save = parseSaveGame(parsed);
  if (!save) {
    discardStoredSave(storage);
    return null;
  }
  return save;
}

/** Persist a validated save. Returns false on SSR, invalid input, or storage failure. */
export function writeSaveGame(save: SaveGameState): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;

  const valid = parseSaveGame(save);
  if (!valid) return false;

  try {
    storage.setItem(SAVE_GAME_KEY, JSON.stringify(valid));
    return true;
  } catch {
    return false;
  }
}

/** Remove the save slot. No-op when storage is unavailable. */
export function clearSaveGame() {
  const storage = getLocalStorage();
  if (!storage) return;
  discardStoredSave(storage);
}

export function hasValidSaveGame(): boolean {
  return loadSaveGame() !== null;
}
