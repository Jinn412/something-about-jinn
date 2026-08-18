import pathArt from "@/assets/2path.png";

const SCENE_W = 1536;
const SCENE_H = 1024;

export type Scene6Drift = 0 | 1 | 2;

export function ScenePath({ drift, holdEnter }: { drift: Scene6Drift; holdEnter: boolean }) {
  const cam = holdEnter
    ? "ps-s6-path-hold"
    : drift >= 2
      ? "ps-s6-path-drift2"
      : drift >= 1
        ? "ps-s6-path-drift1"
        : "ps-s6-path-settle";

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className={`relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full overflow-hidden ${cam}`}>
          <img
            src={pathArt}
            alt=""
            width={SCENE_W}
            height={SCENE_H}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
}
