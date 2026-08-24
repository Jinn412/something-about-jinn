import type { DialogueLine } from "./types";

export const MERCHANT = "旅行商人";

/** Opening dialogue of the main hub. Add new scripts below in the same shape. */
export function merchantIntro(playerName: string): DialogueLine[] {
  const name = playerName.trim() || "旅人";
  return [
    { speaker: MERCHANT, text: "哦？新客人？" },
    { speaker: MERCHANT, text: `欢迎你，${name}。` },
    { speaker: MERCHANT, text: "不过……今天好像出了点小问题。" },
    { speaker: MERCHANT, text: "我的车上，混进了一些不属于我的东西。" },
    { speaker: MERCHANT, text: "挺奇怪的，对吧？" },
    {
      speaker: MERCHANT,
      text: "这个给你。",
      reward: { icon: "🔍", label: "你得到了一把放大镜！" },
    },
    { speaker: MERCHANT, text: "拿着它找找看吧。" },
    { speaker: MERCHANT, text: "说不定，这里面刚好有你想找的东西。" },
  ];
}

/** After Photo Story 01 is completed and the player returns to the hub. */
export function merchantPhotoComplete(): DialogueLine[] {
  return [
    { speaker: MERCHANT, text: "原来如此。" },
    { speaker: MERCHANT, text: "她好像一直都在寻找下一张地图。" },
    { speaker: MERCHANT, text: "看来，我们找到了她的第一块碎片。" },
  ];
}

/** After Vase Story is completed and the player returns to the hub. */
export function merchantVaseComplete(): DialogueLine[] {
  return [
    {
      speaker: MERCHANT,
      text: "两年多啊……看来她已经知道把很多人的声音，慢慢变成一个能落地的答案了。",
    },
    { speaker: MERCHANT, text: "好了。那架望远镜，好像也愿意让你看看了。" },
  ];
}
