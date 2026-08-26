export type SceneId = "title" | "setup" | "hub" | "story-photo" | "story-vase" | "story-telescope";

export type FinalSequencePhase =
  | "none"
  | "merchant"
  | "starfruit"
  | "starfruit-ready"
  | "eating"
  | "taste"
  | "celebration"
  | "celebration-complete"
  | "hold"
  | "fade"
  | "end-title"
  | "complete";

export type ItemKind = "main" | "locked" | "egg";

export interface InteractiveItem {
  /** stable id, used for state (found items, story unlocks) */
  id: string;
  /** chinese display name shown in the zoom frame */
  name: string;
  kind: ItemKind;
  /** hotspot on the hub scene, in % of the scene image */
  hotspot: { left: number; top: number; width: number; height: number };
  /** optional crop for ItemZoom only — click hotspot stays unchanged */
  zoomHotspot?: { left: number; top: number; width: number; height: number };
  /** lines shown under the zoomed item */
  lines: string[];
  /** if set, clicking "继续" in the zoom view moves to this scene */
  goToScene?: SceneId;
  /** optional dedicated artwork instead of the 1:1 crop of the scene */
  art?: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  /** optional "item get" card shown with this line */
  reward?: { icon: string; label: string };
}

export interface GameState {
  playerName: string;
  favoriteThing: string;
  /** 0..10, reserved for the future heart / affection progression */
  hearts: number;
  maxHearts: number;
  hasMagnifier: boolean;
  inspectedItems: string[];
  unlockedStories: string[];
  /** Photo Story 01 fully completed */
  photoStoryComplete: boolean;
  /** Vase Story fully completed */
  vaseStoryComplete: boolean;
  /** Telescope Story fully completed */
  telescopeStoryComplete: boolean;
  /** One-shot merchant dialogue after returning from Photo Story */
  pendingPhotoMerchantDialogue: boolean;
  /** One-shot merchant dialogue after returning from Vase Story */
  pendingVaseMerchantDialogue: boolean;
  /** One-shot merchant dialogue after returning from Telescope Story */
  pendingTelescopeMerchantDialogue: boolean;
  /** Unique Hub side-item ids the player has opened (not photo/vase/telescope). */
  viewedSideItems: string[];
  /** 10th heart granted; next round uses this for the final merchant sequence. */
  finalRewardReady: boolean;
  /** Ending has begun; never restart the final sequence. */
  finalSequenceStarted: boolean;
  /** Ending finished on the black title card. */
  finalSequenceComplete: boolean;
  finalSequencePhase: FinalSequencePhase;
}
