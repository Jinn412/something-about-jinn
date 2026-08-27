import { useEffect, useMemo, useState } from "react";
import hubScene from "@/assets/hub-scene.png";
import merchantSprite from "@/assets/merchant.png";
import { RainOverlay } from "../RainOverlay";
import { DialogueBox } from "../DialogueBox";
import { ItemZoom } from "../ItemZoom";
import { HUB_ITEMS } from "@/game/items";
import { resolveHubItem } from "@/game/photoItems";
import { isOfficialStoryEntry, withDevStoryEntry } from "@/game/devStories";
import { merchantIntro, merchantPhotoComplete, merchantVaseComplete, merchantTelescopeComplete } from "@/game/dialogue";
import { useGame } from "@/game/GameContext";
import { FinalSequence } from "../FinalSequence";
import type { FinalSequencePhase, InteractiveItem } from "@/game/types";
import "../final-sequence.css";

const MAGNIFIER_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' shape-rendering='crispEdges' viewBox='0 0 16 16'%3E%3Cpath fill='%232b1b13' d='M4 1h6v1H4zM3 2h1v1H3zM10 2h1v1h-1zM2 3h1v6H2zM11 3h1v6h-1zM3 9h1v1H3zM10 9h1v1h-1zM4 10h6v1H4zM9 11h2v2H9zM10 13h3v3h-3z'/%3E%3Cpath fill='%23bcd8e8' d='M4 2h6v1H4zM3 3h8v6H3zM4 9h6v1H4z'/%3E%3C/svg%3E\") 8 8, pointer";

/** src/assets/merchant.png — verified 1024×1536 (RGBA). */
const MERCHANT_W = 1024;
const MERCHANT_H = 1536;

/** Merchant anchor in hub-scene.png coordinates (1536×1024), not viewport %. */
const MERCHANT_SCENE = {
  left: "9%",
  bottom: "18%",
  height: "51%",
} as const;

export function HubScene({
  preview = false,
  onPreviewPhase,
  onExitPreview,
}: {
  /** DEV visual-only ending; never from production. */
  preview?: boolean;
  onPreviewPhase?: (phase: FinalSequencePhase) => void;
  onExitPreview?: () => void;
}) {
  const previewOnly = import.meta.env.DEV && preview;
  const {
    playerName,
    giveMagnifier,
    hasMagnifier,
    markInspected,
    unlockStory,
    goToScene,
    isFading,
    photoStoryComplete,
    vaseStoryComplete,
    telescopeStoryComplete,
    pendingPhotoMerchantDialogue,
    pendingVaseMerchantDialogue,
    pendingTelescopeMerchantDialogue,
    clearPhotoMerchantDialogue,
    clearVaseMerchantDialogue,
    clearTelescopeMerchantDialogue,
    markSideItemViewed,
    tryGrantFinalHeart,
    startFinalSequence,
    hearts,
    finalRewardReady,
    finalSequenceStarted,
    finalSequenceComplete,
    finalSequencePhase,
    enterDevStory,
    clearDevStoryEntry,
  } = useGame();
  const [dialogueDone, setDialogueDone] = useState(hasMagnifier || previewOnly);
  const [photoDialogueActive, setPhotoDialogueActive] = useState(false);
  const [vaseDialogueActive, setVaseDialogueActive] = useState(false);
  const [telescopeDialogueActive, setTelescopeDialogueActive] = useState(false);
  const [zoomed, setZoomed] = useState<InteractiveItem | null>(null);
  const [previewSequenceOn, setPreviewSequenceOn] = useState(false);
  const [previewPhase, setPreviewPhase] = useState<FinalSequencePhase>("none");

  const script = useMemo(() => merchantIntro(playerName), [playerName]);
  const photoCompleteScript = useMemo(() => merchantPhotoComplete(), []);
  const vaseCompleteScript = useMemo(() => merchantVaseComplete(), []);
  const telescopeCompleteScript = useMemo(() => merchantTelescopeComplete(), []);

  useEffect(() => {
    if (pendingPhotoMerchantDialogue && hasMagnifier) {
      setDialogueDone(true);
      setPhotoDialogueActive(true);
    }
  }, [pendingPhotoMerchantDialogue, hasMagnifier]);

  useEffect(() => {
    if (pendingVaseMerchantDialogue && hasMagnifier) {
      setDialogueDone(true);
      setVaseDialogueActive(true);
    }
  }, [pendingVaseMerchantDialogue, hasMagnifier]);

  useEffect(() => {
    if (pendingTelescopeMerchantDialogue && hasMagnifier) {
      setDialogueDone(true);
      setTelescopeDialogueActive(true);
    }
  }, [pendingTelescopeMerchantDialogue, hasMagnifier]);

  const merchantBusy =
    photoDialogueActive ||
    vaseDialogueActive ||
    telescopeDialogueActive ||
    pendingPhotoMerchantDialogue ||
    pendingVaseMerchantDialogue ||
    pendingTelescopeMerchantDialogue;
  const balloonPhase = previewOnly ? previewPhase : finalSequencePhase;
  const showCartOcclusion =
    balloonPhase === "celebration" ||
    balloonPhase === "celebration-complete" ||
    balloonPhase === "hold" ||
    balloonPhase === "fade" ||
    balloonPhase === "end-title" ||
    balloonPhase === "complete";
  const endingLocked =
    previewOnly ||
    (hearts >= 10 && finalRewardReady) ||
    finalSequenceStarted ||
    finalSequenceComplete;
  const hubIdle = dialogueDone && !merchantBusy && !zoomed && !isFading && !endingLocked;

  const openItem = (item: InteractiveItem) => {
    if (previewOnly || endingLocked) return;
    markInspected(item.id);
    if (item.kind === "egg") markSideItemViewed(item.id);
    setZoomed(
      withDevStoryEntry(
        resolveHubItem(item, photoStoryComplete, vaseStoryComplete, telescopeStoryComplete),
      ),
    );
  };

  useEffect(() => {
    if (previewOnly) return;
    if (!hubIdle) return;
    tryGrantFinalHeart();
  }, [previewOnly, hubIdle, tryGrantFinalHeart]);

  useEffect(() => {
    if (previewOnly) return;
    if (hearts < 10 || !finalRewardReady) return;
    if (finalSequenceStarted || finalSequenceComplete) return;
    if (!dialogueDone || merchantBusy || zoomed || isFading) return;
    const id = window.setTimeout(() => startFinalSequence(), 420 + 850);
    return () => window.clearTimeout(id);
  }, [
    previewOnly,
    hearts,
    finalRewardReady,
    finalSequenceStarted,
    finalSequenceComplete,
    dialogueDone,
    merchantBusy,
    zoomed,
    isFading,
    startFinalSequence,
  ]);

  useEffect(() => {
    if (!previewOnly) return;
    const id = window.setTimeout(() => {
      setPreviewSequenceOn(true);
      setPreviewPhase("merchant");
      onPreviewPhase?.("merchant");
    }, 850);
    return () => window.clearTimeout(id);
  }, [previewOnly, onPreviewPhase]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[oklch(0.22_0.03_250)]">
      <img
        src={hubScene}
        alt="雨天的树林里，旅行商人的猪车停在中央，车上摆满了货物"
        width={1536}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {showCartOcclusion && (
        <div
          className="hub-cart-occlusion pointer-events-none absolute inset-0 z-[8] flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
            <img
              src={hubScene}
              alt=""
              width={1536}
              height={1024}
              draggable={false}
              className="hub-cart-occlusion-cart absolute inset-0 h-full w-full object-cover"
            />
            <img
              src={hubScene}
              alt=""
              width={1536}
              height={1024}
              draggable={false}
              className="hub-cart-occlusion-pig absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Scene-aligned layer — same object-cover box as hub-scene.png (1536×1024) */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
        <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
          <img
            src={merchantSprite}
            alt="旅行商人"
            width={MERCHANT_W}
            height={MERCHANT_H}
            loading="lazy"
            className={`absolute${(previewOnly ? previewPhase : finalSequencePhase) === "celebration" ? " final-merchant-bob" : ""}`}
            style={{
              left: MERCHANT_SCENE.left,
              bottom: MERCHANT_SCENE.bottom,
              height: MERCHANT_SCENE.height,
              width: "auto",
            }}
          />
        </div>
      </div>

      <RainOverlay opacity={0.45} />

      {/* interactive hotspots — configured in src/game/items.ts */}
      {dialogueDone &&
        !photoDialogueActive &&
        !vaseDialogueActive &&
        !telescopeDialogueActive &&
        !endingLocked && (
        <div className="absolute inset-0 z-30">
          {HUB_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.name}
              onClick={() => openItem(item)}
              className="group absolute"
              style={{
                left: `${item.hotspot.left}%`,
                top: `${item.hotspot.top}%`,
                width: `${item.hotspot.width}%`,
                height: `${item.hotspot.height}%`,
                cursor: hasMagnifier ? MAGNIFIER_CURSOR : "pointer",
              }}
            >
              <span
                aria-hidden
                className="item-sparkle absolute inset-0 hidden group-hover:block"
                style={{
                  boxShadow: "inset 0 0 0 3px rgba(255,246,200,0.85)",
                  background: "rgba(255,246,200,0.16)",
                }}
              />
            </button>
          ))}
        </div>
      )}

      {!dialogueDone && (
        <DialogueBox
          lines={script}
          onFinish={() => {
            giveMagnifier();
            setDialogueDone(true);
          }}
        />
      )}

      {photoDialogueActive && (
        <DialogueBox
          lines={photoCompleteScript}
          onFinish={() => {
            clearPhotoMerchantDialogue();
            setPhotoDialogueActive(false);
          }}
        />
      )}

      {vaseDialogueActive && (
        <DialogueBox
          lines={vaseCompleteScript}
          onFinish={() => {
            clearVaseMerchantDialogue();
            setVaseDialogueActive(false);
          }}
        />
      )}

      {telescopeDialogueActive && (
        <DialogueBox
          lines={telescopeCompleteScript}
          onFinish={() => {
            clearTelescopeMerchantDialogue();
            setTelescopeDialogueActive(false);
          }}
        />
      )}

      {zoomed && !endingLocked && (
        <ItemZoom
          item={zoomed}
          photoStoryComplete={photoStoryComplete}
          vaseStoryComplete={vaseStoryComplete}
          telescopeStoryComplete={telescopeStoryComplete}
          showDevMark={
            Boolean(
              zoomed.goToScene &&
                !isOfficialStoryEntry(
                  zoomed.id,
                  photoStoryComplete,
                  vaseStoryComplete,
                  telescopeStoryComplete,
                ),
            )
          }
          onClose={() => setZoomed(null)}
          onReplayPhotoStory={() => {
            setZoomed(null);
            clearDevStoryEntry();
            goToScene("story-photo");
          }}
          onReplayVaseStory={() => {
            setZoomed(null);
            clearDevStoryEntry();
            goToScene("story-vase");
          }}
          onReplayTelescopeStory={() => {
            setZoomed(null);
            clearDevStoryEntry();
            goToScene("story-telescope");
          }}
          onEnterStory={(item) => {
            if (!item.goToScene) return;
            setZoomed(null);
            if (
              isOfficialStoryEntry(
                item.id,
                photoStoryComplete,
                vaseStoryComplete,
                telescopeStoryComplete,
              )
            ) {
              clearDevStoryEntry();
              unlockStory(item.id);
              goToScene(item.goToScene);
              return;
            }
            enterDevStory(item.goToScene);
          }}
        />
      )}

      {previewOnly
        ? previewSequenceOn && (
            <FinalSequence
              preview
              onPhaseChange={(phase) => {
                setPreviewPhase(phase);
                onPreviewPhase?.(phase);
              }}
              onExitPreview={onExitPreview}
            />
          )
        : finalSequenceStarted && <FinalSequence />}
    </div>
  );
}
