import photoArt from "@/assets/photo-grassland.png";
import type { InteractiveItem } from "./types";

/**
 * All interactive objects on the merchant's cart.
 * Hotspots are percentages of the hub scene image (1536 x 1024).
 * Add new items here — the hub scene renders them automatically.
 */
export const HUB_ITEMS: InteractiveItem[] = [
  {
    id: "photo",
    name: "一张旧照片",
    kind: "main",
    hotspot: { left: 34.2, top: 43.5, width: 8.2, height: 11 },
    lines: ["照片有点旧了，边角都磨白了。", "草原、蒙古包，还有一个小女孩。"],
    goToScene: "story-photo",
    art: photoArt,
  },
  {
    id: "vase",
    name: "一个珍贵的陶瓷展品",
    kind: "locked",
    hotspot: { left: 43.4, top: 42.5, width: 6.4, height: 12 },
    zoomHotspot: { left: 42.0, top: 42.2, width: 7.0, height: 12.3 },
    lines: ["？", "似乎还看不出什么。"],
  },
  {
    id: "telescope",
    name: "一个望远镜",
    kind: "locked",
    hotspot: { left: 50, top: 41.5, width: 9, height: 12 },
    lines: ["？", "似乎还缺少一些线索。"],
  },
  {
    id: "flowers",
    name: "一盆花",
    kind: "egg",
    hotspot: { left: 59.5, top: 42.5, width: 7.5, height: 12.5 },
    lines: ["有人给这盆花浇过水，土还是湿的。", "Jinn 好像很喜欢会开花的东西。"],
  },
  {
    id: "plant",
    name: "热带植物",
    kind: "egg",
    hotspot: { left: 32.8, top: 54.5, width: 7.5, height: 12 },
    lines: ["这株热带植物一点也不怕冷。", "Jinn 是不是很想念南方的夏天？"],
  },
  {
    id: "book",
    name: "一本旧书",
    kind: "egg",
    hotspot: { left: 39.8, top: 56.5, width: 7, height: 11 },
    lines: ["书页里夹着一张写满字的小纸条。", "看起来 Jinn 喜欢把故事记下来。"],
  },
  {
    id: "goggles",
    name: "泳镜",
    kind: "egg",
    hotspot: { left: 47.2, top: 60.5, width: 7.5, height: 6.5 },
    lines: ["这个泳镜看起来是属于 Jinn 的。", "她是游泳健将吗？"],
  },
  {
    id: "trinkets",
    name: "奇怪的小物件",
    kind: "egg",
    hotspot: { left: 55.5, top: 59, width: 11, height: 8.5 },
    lines: ["一排小玩偶，摆得整整齐齐。", "Jinn 大概走到哪里都会捡一个回家。"],
  },
];
