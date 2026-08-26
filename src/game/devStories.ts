import type { InteractiveItem, SceneId } from "./types";

export const IS_DEV = import.meta.env.DEV;

export const DEV_STORY_SCENES = {
  photo: "story-photo",
  vase: "story-vase",
  telescope: "story-telescope",
} as const satisfies Record<string, SceneId>;

export function isOfficialStoryEntry(
  itemId: string,
  photoStoryComplete: boolean,
  vaseStoryComplete = false,
  telescopeStoryComplete = false,
) {
  if (itemId === "photo") return !photoStoryComplete;
  if (itemId === "vase") return photoStoryComplete && !vaseStoryComplete;
  if (itemId === "telescope") return vaseStoryComplete && !telescopeStoryComplete;
  return false;
}

/** DEV only: attach a test story entrance without changing official unlock state. */
export function withDevStoryEntry(item: InteractiveItem): InteractiveItem {
  if (!IS_DEV) return item;
  const scene = DEV_STORY_SCENES[item.id as keyof typeof DEV_STORY_SCENES];
  if (!scene) return item;
  return { ...item, goToScene: scene };
}
