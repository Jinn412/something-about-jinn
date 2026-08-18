import toGzArt from "@/assets/toGZ.png";
import trainSprite from "@/assets/train.png";

const SCENE_W = 1536;
const SCENE_H = 1024;
const TRAIN_W = 2172;
const TRAIN_H = 724;

/** train.png in toGZ.png coordinates (1536×1024). Wheels sit on the rail band. */
const TRAIN_SCENE = {
  width: "48%",
  height: "auto",
  bottom: "13.5%",
} as const;

export function SceneToGuangzhou() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full overflow-hidden">
          <img
            src={toGzArt}
            alt=""
            width={SCENE_W}
            height={SCENE_H}
            draggable={false}
            className="absolute inset-0 h-full w-full"
          />
          <div
            className="pointer-events-none absolute ps-geo-train"
            style={{
              bottom: TRAIN_SCENE.bottom,
              width: TRAIN_SCENE.width,
              height: TRAIN_SCENE.height,
            }}
          >
            <img
              src={trainSprite}
              alt=""
              width={TRAIN_W}
              height={TRAIN_H}
              draggable={false}
              className="block h-auto w-full ps-geo-train-body"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
