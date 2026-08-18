export type SceneId = "title" | "setup" | "hub" | "story-photo";

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
  /** One-shot merchant dialogue after returning from Photo Story */
  pendingPhotoMerchantDialogue: boolean;
}
