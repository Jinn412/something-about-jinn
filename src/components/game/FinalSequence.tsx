import { useEffect, useMemo, useRef, useState } from "react";
import starfruitArt from "@/assets/starfruit.png";
import endingBalloonsArt from "@/assets/endingBalloons.png";
import { DialogueBox } from "./DialogueBox";
import { merchantFinalGift, starfruitTasteLines } from "@/game/dialogue";
import { PREVIEW_FAVORITE_FALLBACK, exitFinalPreviewUrl } from "@/game/finalPreview";
import { useGame } from "@/game/GameContext";
import type { FinalSequencePhase } from "@/game/types";
import "./final-sequence.css";

const STARFRUIT_REVEAL_MS = 1750;
const STARFRUIT_HOLD_MS = 800;
const STARFRUIT_EAT_MS = 520;
const EAT_PAUSE_MS = 300;
/** 70% of the 10s balloon rise — balloons still visible, then the quiet hold. */
const BALLOON_TO_HOLD_MS = 7000;
const ENDING_HOLD_MS = 1100;
const ENDING_FADE_MS = 1750;
const ENDING_BLACK_HOLD_MS = 800;
const ENDING_TITLE_MS = 1200;
const ENDING_RESTART_DELAY_MS = 800;
const ENDING_LEAVE_MS = 600;

const DIM_PHASES: FinalSequencePhase[] = [
  "starfruit",
  "starfruit-ready",
  "eating",
  "taste",
  "celebration",
];

interface FinalSequenceProps {
  /** DEV visual-only run; never writes GameContext progression. */
  preview?: boolean;
  onPhaseChange?: (phase: FinalSequencePhase) => void;
  /** Leave ?preview=final without resetting real progression. */
  onExitPreview?: () => void;
}

/** Hub ending: merchant gift → starfruit → balloons → fade to black → title. */
export function FinalSequence({ preview = false, onPhaseChange, onExitPreview }: FinalSequenceProps) {
  const {
    favoriteThing,
    finalSequencePhase: livePhase,
    setFinalSequencePhase,
    completeFinalSequence,
    resetGame,
  } = useGame();

  const [previewPhase, setPreviewPhase] = useState<FinalSequencePhase>("merchant");

  const previewOnly = import.meta.env.DEV && preview;
  const phase = previewOnly ? previewPhase : livePhase;
  const favoriteForLines = previewOnly
    ? favoriteThing.trim() || PREVIEW_FAVORITE_FALLBACK
    : favoriteThing;

  const setPhase = (next: FinalSequencePhase) => {
    if (previewOnly) {
      setPreviewPhase(next);
      onPhaseChange?.(next);
      return;
    }
    setFinalSequencePhase(next);
  };

  const merchantLines = useMemo(() => merchantFinalGift(), []);
  const tasteLines = useMemo(() => starfruitTasteLines(favoriteForLines), [favoriteForLines]);

  const setPhaseRef = useRef(setPhase);
  setPhaseRef.current = setPhase;
  const eatLocked = useRef(false);
  const leavingLock = useRef(false);
  const [showRestart, setShowRestart] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (phase !== "starfruit") return;
    const id = window.setTimeout(
      () => setPhaseRef.current("starfruit-ready"),
      STARFRUIT_REVEAL_MS + STARFRUIT_HOLD_MS,
    );
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "eating") return;
    const id = window.setTimeout(
      () => setPhaseRef.current("taste"),
      STARFRUIT_EAT_MS + EAT_PAUSE_MS,
    );
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "celebration") return;
    const id = window.setTimeout(() => setPhaseRef.current("hold"), BALLOON_TO_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "hold") return;
    const id = window.setTimeout(() => setPhaseRef.current("fade"), ENDING_HOLD_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fade") return;
    const id = window.setTimeout(
      () => setPhaseRef.current("end-title"),
      ENDING_FADE_MS + ENDING_BLACK_HOLD_MS,
    );
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "end-title") return;
    const id = window.setTimeout(() => {
      if (previewOnly) {
        setPhaseRef.current("complete");
        return;
      }
      completeFinalSequence();
    }, ENDING_TITLE_MS);
    return () => window.clearTimeout(id);
  }, [phase, previewOnly, completeFinalSequence]);

  useEffect(() => {
    if (phase !== "complete") {
      setShowRestart(false);
      return;
    }
    const id = window.setTimeout(() => setShowRestart(true), ENDING_RESTART_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  const leaveToNewGame = () => {
    if (leavingLock.current) return;
    leavingLock.current = true;
    setLeaving(true);
    window.setTimeout(() => {
      if (previewOnly) {
        exitFinalPreviewUrl();
        onExitPreview?.();
        return;
      }
      resetGame();
    }, ENDING_LEAVE_MS);
  };

  const showStarfruit =
    phase === "starfruit" || phase === "starfruit-ready" || phase === "eating";
  const starfruitClickable = phase === "starfruit-ready" && !eatLocked.current;
  const showDim = DIM_PHASES.includes(phase);
  const dimOff = phase === "celebration";
  const showBalloons =
    phase === "celebration" ||
    phase === "celebration-complete" ||
    phase === "hold" ||
    phase === "fade" ||
    phase === "end-title" ||
    phase === "complete";
  const showEndFade = phase === "fade" || phase === "end-title" || phase === "complete";
  const showEndTitle = phase === "end-title" || phase === "complete";

  const eatStarfruit = () => {
    if (phase !== "starfruit-ready" || eatLocked.current) return;
    eatLocked.current = true;
    setPhase("eating");
  };

  return (
    <>
      {showDim && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center overflow-hidden">
          <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
            <div className={`final-dim absolute inset-0 ${dimOff ? "is-off" : "is-on"}`} />
          </div>
        </div>
      )}

      {showStarfruit && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`final-starfruit-wrap ${
                  phase === "starfruit" ? "is-revealing" : ""
                } ${phase === "starfruit-ready" ? "is-idle" : ""} ${
                  phase === "eating" ? "is-eating" : ""
                }`}
              >
                <div className="final-starfruit-float h-full">
                  <button
                    type="button"
                    aria-label="星之果实"
                    disabled={!starfruitClickable}
                    onClick={eatStarfruit}
                    className="final-starfruit-btn pointer-events-auto h-full"
                  >
                    <img
                      src={starfruitArt}
                      alt=""
                      draggable={false}
                      className="h-full w-auto max-w-none"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBalloons && (
        <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center overflow-hidden" aria-hidden>
          <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
            <img
              src={endingBalloonsArt}
              alt=""
              draggable={false}
              className="final-balloons absolute inset-0 h-full w-full object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        </div>
      )}

      {phase === "merchant" && (
        <div className="absolute inset-0 z-[60]">
          <DialogueBox lines={merchantLines} onFinish={() => setPhase("starfruit")} />
        </div>
      )}

      {phase === "taste" && (
        <div className="absolute inset-0 z-[60]">
          <DialogueBox lines={tasteLines} onFinish={() => setPhase("celebration")} />
        </div>
      )}

      {showEndFade && (
        <div
          className={`final-end-fade ${phase === "fade" ? "is-fading" : "is-black"}`}
          aria-hidden
        />
      )}

      {showEndTitle && (
        <div className={`final-end-title-wrap${leaving ? " is-leaving" : ""}`}>
          <h1 className="final-end-title is-in">
            Something
            <br />
            About Jinn
          </h1>
          {showRestart && (
            <button type="button" className="final-end-restart" onClick={leaveToNewGame}>
              重新开始
            </button>
          )}
        </div>
      )}
    </>
  );
}
