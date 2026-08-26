import { useState } from "react";
import hubScene from "@/assets/hub-scene.png";
import { PhotoSecretNote } from "./story-photo/PhotoSecretNote";
import { VaseSecretNote } from "./story-vase/VaseSecretNote";
import { TelescopeSecretNote } from "./story-telescope/TelescopeSecretNote";
import type { InteractiveItem } from "@/game/types";

const SCENE_W = 1536;
const SCENE_H = 1024;
const BOX_W = 380;

interface ItemZoomProps {
  item: InteractiveItem;
  onClose: () => void;
  onEnterStory?: (item: InteractiveItem) => void;
  onReplayPhotoStory?: () => void;
  onReplayVaseStory?: () => void;
  onReplayTelescopeStory?: () => void;
  photoStoryComplete?: boolean;
  vaseStoryComplete?: boolean;
  telescopeStoryComplete?: boolean;
  showDevMark?: boolean;
}

/** Click -> 1:1 pixel zoom of the object, then back to the hub. */
export function ItemZoom({
  item,
  onClose,
  onEnterStory,
  onReplayPhotoStory,
  onReplayVaseStory,
  onReplayTelescopeStory,
  photoStoryComplete,
  vaseStoryComplete,
  telescopeStoryComplete,
  showDevMark,
}: ItemZoomProps) {
  const [secretNoteOpen, setSecretNoteOpen] = useState(false);
  const crop = item.zoomHotspot ?? item.hotspot;
  const bgW = BOX_W / (crop.width / 100);
  const bgH = bgW * (SCENE_H / SCENE_W);
  const boxH = (crop.height / 100) * bgH;
  const canEnterStory = Boolean(item.goToScene && onEnterStory);
  const canSecretNote =
    (item.id === "photo" && photoStoryComplete) ||
    (item.id === "vase" && vaseStoryComplete) ||
    (item.id === "telescope" && telescopeStoryComplete);
  const openSecretNote = () => {
    if (canSecretNote) setSecretNoteOpen(true);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div className="zoom-in-pixel w-full max-w-xl">
        <div className="pixel-frame p-4">
          <div className="flex justify-center bg-black/40 p-4">
            {item.art ? (
              <img
                src={item.art}
                alt={item.name}
                width={1024}
                height={768}
                loading="lazy"
                className={`max-h-[46vh] w-auto ${canSecretNote ? "cursor-pointer" : ""}`}
                onDoubleClick={openSecretNote}
              />
            ) : (
              <div
                aria-label={item.name}
                role="img"
                className={canSecretNote ? "cursor-pointer" : ""}
                onDoubleClick={openSecretNote}
                style={{
                  width: BOX_W,
                  height: boxH,
                  backgroundImage: `url(${hubScene})`,
                  backgroundSize: `${bgW}px ${bgH}px`,
                  backgroundPosition: `-${(crop.left / 100) * bgW}px -${(crop.top / 100) * bgH}px`,
                  imageRendering: "pixelated",
                }}
              />
            )}
          </div>

          <div className="pixel-panel mt-4 px-5 py-4 text-sm leading-8 md:text-base">
            <div className="mb-2 text-xs text-plum md:text-sm">{item.name}</div>
            {item.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            {canEnterStory && (
              <button
                type="button"
                onClick={() => onEnterStory!(item)}
                className="pixel-btn px-5 py-3 text-xs md:text-sm"
              >
                ▶ 看看
                {import.meta.env.DEV && showDevMark ? " DEV" : ""}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="pixel-btn px-5 py-3 text-xs md:text-sm"
            >
              返回
            </button>
          </div>
        </div>
      </div>

      {secretNoteOpen && item.id === "photo" && (
        <PhotoSecretNote
          onClose={() => setSecretNoteOpen(false)}
          onReplay={() => {
            setSecretNoteOpen(false);
            onReplayPhotoStory?.();
          }}
        />
      )}
      {secretNoteOpen && item.id === "vase" && (
        <VaseSecretNote
          onClose={() => setSecretNoteOpen(false)}
          onReplay={() => {
            setSecretNoteOpen(false);
            onReplayVaseStory?.();
          }}
        />
      )}
      {secretNoteOpen && item.id === "telescope" && (
        <TelescopeSecretNote
          onClose={() => setSecretNoteOpen(false)}
          onReplay={() => {
            setSecretNoteOpen(false);
            onReplayTelescopeStory?.();
          }}
        />
      )}
    </div>
  );
}
