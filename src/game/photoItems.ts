import type { InteractiveItem } from "./types";

/** Resolve hub item display/unlock state after Photo Story progress. Hotspots unchanged. */
export function resolveHubItem(
  item: InteractiveItem,
  photoStoryComplete: boolean,
  vaseStoryComplete = false,
): InteractiveItem {
  if (item.id === "photo" && photoStoryComplete) {
    return {
      ...item,
      lines: [
        "照片边角已经磨白，但画面里多了一条小路。",
        "路延伸向远方——她似乎还没打算停下来。",
        "（双击照片，可查看秘密纸条）",
      ],
      goToScene: undefined,
    };
  }

  if (item.id === "vase" && vaseStoryComplete) {
    return {
      ...item,
      kind: "main",
      lines: [
        "陶瓷上的花纹，已经能看懂了。",
        "（双击陶瓷，可查看秘密纸条）",
      ],
      goToScene: undefined,
    };
  }

  if (item.id === "vase" && photoStoryComplete) {
    return {
      ...item,
      kind: "main",
      lines: [
        "陶瓷上的花纹，好像开始能看懂了。",
        "也许值得一探究竟。",
      ],
      goToScene: "story-vase",
    };
  }

  if (item.id === "telescope" && vaseStoryComplete) {
    return {
      ...item,
      kind: "main",
      lines: ["镜筒里好像有了新的方向。", "也许值得看一看。"],
      goToScene: "story-telescope",
    };
  }

  return item;
}
