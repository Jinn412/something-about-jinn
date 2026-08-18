export type PhotoSceneId = 1 | 2 | 3 | 4 | 5 | 6;

export type PhotoBeat =
  | { kind: "reveal"; scene: PhotoSceneId }
  | { kind: "line"; scene: PhotoSceneId; text: string }
  | { kind: "profile"; scene: 1 }
  | { kind: "flip"; scene: PhotoSceneId }
  | { kind: "mapUnlock"; scene: 2 | 4; variant: "imu" | "ntu" }
  | { kind: "galleryStage"; scene: 3; stage: number }
  | { kind: "digital"; scene: 5; level: number }
  | { kind: "photoPath"; scene: 6 }
  | { kind: "memoryComplete"; scene: 6 };

/** Flat click-through sequence for Photo Story 01. */
export const PHOTO_STORY_BEATS: PhotoBeat[] = [
  { kind: "reveal", scene: 1 },
  { kind: "line", scene: 1, text: "她的故事，开始于一片很大的草原。" },
  { kind: "line", scene: 1, text: "世界很大。" },
  { kind: "line", scene: 1, text: "而她很早就想知道，草原之外还有什么。" },
  { kind: "profile", scene: 1 },
  { kind: "flip", scene: 2 },

  { kind: "line", scene: 2, text: "于是，她去了第一张更大的地图。" },
  { kind: "line", scene: 2, text: "在内蒙古大学，她学习新闻学。" },
  {
    kind: "line",
    scene: 2,
    text: "她开始学习如何观察一件事，理解一个人，再把它讲成一个故事。",
  },
  { kind: "mapUnlock", scene: 2, variant: "imu" },
  { kind: "flip", scene: 3 },

  { kind: "galleryStage", scene: 3, stage: 0 },
  { kind: "line", scene: 3, text: "但后来，她发现自己开始不满足于只是讲述故事。" },
  { kind: "galleryStage", scene: 3, stage: 1 },
  { kind: "line", scene: 3, text: "如果故事可以被写出来，为什么不能被走进去？" },
  { kind: "galleryStage", scene: 3, stage: 2 },
  { kind: "line", scene: 3, text: "于是，她走进了展览展示行业。" },
  { kind: "galleryStage", scene: 3, stage: 3 },
  { kind: "line", scene: 3, text: "从观察故事，到参与创造故事。" },
  { kind: "galleryStage", scene: 3, stage: 4 },
  { kind: "flip", scene: 4 },

  { kind: "line", scene: 4, text: "两年多以后，她又一次不满足于已经熟悉的答案。" },
  { kind: "line", scene: 4, text: "所以，她选择重新回到学校。" },
  { kind: "line", scene: 4, text: "如果一个人知道自己不知道什么，她可以去学习。" },
  { kind: "line", scene: 4, text: "可如果一个人连自己不知道什么都不知道呢？" },
  { kind: "line", scene: 4, text: "当世界变得足够大，她就再也没办法对那些未知视而不见。" },
  { kind: "mapUnlock", scene: 4, variant: "ntu" },
  { kind: "flip", scene: 5 },

  { kind: "line", scene: 5, text: "在这里，她开始接触很多从未真正走近的东西。技术、媒介、交互。" },
  { kind: "line", scene: 5, text: "她意识到，故事可以有不只一种讲法。人可以走进故事里，亲手改变它。" },
  { kind: "line", scene: 5, text: "比起知道答案，她开始更喜欢创造新的可能。" },
  { kind: "flip", scene: 6 },

  { kind: "line", scene: 6, text: "她已经走出了很远。" },
  { kind: "line", scene: 6, text: "但她似乎还没打算停下来。" },
  { kind: "memoryComplete", scene: 6 },
];
