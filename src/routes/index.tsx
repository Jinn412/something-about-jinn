import { createFileRoute } from "@tanstack/react-router";
import { GameRoot } from "@/components/game/GameRoot";

const title = "Something About Jinn — 像素互动个人介绍";
const description =
  "一个复古像素 RPG 风格的互动个人介绍：走进雨天的树林，翻找旅行商人猪车上的物件，慢慢认识 Jinn。";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <GameRoot />;
}
