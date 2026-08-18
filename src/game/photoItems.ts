import type { InteractiveItem } from "./types";

/** Resolve hub item display/unlock state after Photo Story progress. Hotspots unchanged. */
export function resolveHubItem(
  item: InteractiveItem,
  photoStoryComplete: boolean,
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

  if (item.id === "vase" && photoStoryComplete) {
    return {
      ...item,
      kind: "main",
      lines: [
        "陶瓷上的花纹，好像开始能看懂了。",
        "也许值得一探究竟。",
      ],
    };
  }

  return item;
}
