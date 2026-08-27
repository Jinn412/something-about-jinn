import { useState, type CSSProperties } from "react";
import hubScene from "@/assets/hub-scene.png";
import { PhotoSecretNote } from "./story-photo/PhotoSecretNote";
import { VaseSecretNote } from "./story-vase/VaseSecretNote";
import { TelescopeSecretNote } from "./story-telescope/TelescopeSecretNote";
import type { InteractiveItem } from "@/game/types";
import { isHubSideItem } from "@/game/items";
import "./story-vase/vase-exhibit-detail.css";
import "./story-telescope/telescope-item-detail.css";
import "./hub-side-item-detail.css";
import "./story-photo/photo-mobile-panels.css";

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

  const isVaseExhibit = item.id === "vase";
  const isTelescopeExhibit = item.id === "telescope";
  const isPhotoExhibit = item.id === "photo";
  const isSideItem = isHubSideItem(item.id);
  const cropArtVars = isVaseExhibit
    ? ({
        "--vase-art-w": BOX_W,
        "--vase-art-h": boxH,
        "--vase-bg-w": bgW,
        "--vase-bg-h": bgH,
        "--vase-bg-x": -((crop.left / 100) * bgW),
        "--vase-bg-y": -((crop.top / 100) * bgH),
      } as CSSProperties)
    : isTelescopeExhibit
      ? ({
          "--tele-art-w": BOX_W,
          "--tele-art-h": boxH,
          "--tele-bg-w": bgW,
          "--tele-bg-h": bgH,
          "--tele-bg-x": -((crop.left / 100) * bgW),
          "--tele-bg-y": -((crop.top / 100) * bgH),
        } as CSSProperties)
      : isSideItem
        ? ({
            "--side-art-w": BOX_W,
            "--side-art-h": boxH,
            "--side-bg-w": bgW,
            "--side-bg-h": bgH,
            "--side-bg-x": -((crop.left / 100) * bgW),
            "--side-bg-y": -((crop.top / 100) * bgH),
          } as CSSProperties)
        : undefined;

  const copyBlock = (
    <div
      className={`pixel-panel mt-4 px-5 py-4 text-sm leading-8 md:text-base${
        isVaseExhibit ? " vase-exhibit-copy" : ""
      }${isTelescopeExhibit ? " telescope-detail-copy" : ""}${
        isPhotoExhibit ? " photo-old-photo-copy" : ""
      }${isSideItem ? " hub-side-item-copy" : ""}`}
    >
      <div
        className={`mb-2 text-xs text-plum md:text-sm${
          isVaseExhibit ? " vase-exhibit-title" : ""
        }${isTelescopeExhibit ? " telescope-detail-title" : ""}${
          isPhotoExhibit ? " photo-old-photo-title" : ""
        }${isSideItem ? " hub-side-item-title" : ""}`}
      >
        {item.name}
      </div>
      {isTelescopeExhibit ? (
        <div className="telescope-detail-copy-text">
          {item.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      ) : isSideItem ? (
        <div className="hub-side-item-copy-text">
          {item.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      ) : (
        item.lines.map((l) => <p key={l}>{l}</p>)
      )}
    </div>
  );

  const actionsBlock = (
    <div
      className={`mt-4 flex justify-end gap-3${isVaseExhibit ? " vase-exhibit-actions" : ""}${
        isTelescopeExhibit ? " telescope-detail-actions" : ""
      }${isPhotoExhibit ? " photo-old-photo-actions" : ""}${isSideItem ? " hub-side-item-actions" : ""}`}
    >
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
      <button type="button" onClick={onClose} className="pixel-btn px-5 py-3 text-xs md:text-sm">
        返回
      </button>
    </div>
  );

  return (
    <div
      className={`absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-4${
        isVaseExhibit ? " vase-exhibit-detail" : ""
      }${isTelescopeExhibit ? " telescope-item-detail" : ""}${
        isPhotoExhibit ? " photo-old-photo-detail" : ""
      }${isSideItem ? " hub-side-item-detail" : ""}`}
    >
      <div
        className={`zoom-in-pixel w-full max-w-xl${isVaseExhibit ? " vase-exhibit-panel" : ""}${
          isTelescopeExhibit ? " telescope-detail-panel" : ""
        }${isPhotoExhibit ? " photo-old-photo-panel" : ""}${isSideItem ? " hub-side-item-panel" : ""}`}
      >
        <div
          className={`pixel-frame p-4${isTelescopeExhibit ? " telescope-detail-frame" : ""}${
            isPhotoExhibit ? " photo-old-photo-frame" : ""
          }${isSideItem ? " hub-side-item-frame" : ""}`}
        >
          <div
            className={`flex justify-center bg-black/40 p-4${
              isVaseExhibit ? " vase-exhibit-art-wrap" : ""
            }${isTelescopeExhibit ? " telescope-detail-visual" : ""}${
              isPhotoExhibit ? " photo-old-photo-visual" : ""
            }${isSideItem ? " hub-side-item-visual" : ""}`}
          >
            {item.art ? (
              <img
                src={item.art}
                alt={item.name}
                width={1024}
                height={768}
                loading="lazy"
                className={`max-h-[46vh] w-auto ${canSecretNote ? "cursor-pointer" : ""}${
                  isPhotoExhibit ? " photo-old-photo-art" : ""
                }`}
                onDoubleClick={openSecretNote}
              />
            ) : (
              <div
                aria-label={item.name}
                role="img"
                className={`${canSecretNote ? "cursor-pointer" : ""}${
                  isVaseExhibit ? " vase-exhibit-art" : ""
                }${isTelescopeExhibit ? " telescope-detail-art" : ""}${
                  isSideItem ? " hub-side-item-art" : ""
                }`}
                onDoubleClick={openSecretNote}
                style={{
                  width: BOX_W,
                  height: boxH,
                  backgroundImage: `url(${hubScene})`,
                  backgroundSize: `${bgW}px ${bgH}px`,
                  backgroundPosition: `-${(crop.left / 100) * bgW}px -${(crop.top / 100) * bgH}px`,
                  imageRendering: "pixelated",
                  ...cropArtVars,
                }}
              />
            )}
          </div>

          {isTelescopeExhibit ? (
            <div className="telescope-detail-copy-col">
              {copyBlock}
              {actionsBlock}
            </div>
          ) : isSideItem ? (
            <div className="hub-side-item-copy-col">
              {copyBlock}
              {actionsBlock}
            </div>
          ) : (
            <>
              {copyBlock}
              {actionsBlock}
            </>
          )}
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
