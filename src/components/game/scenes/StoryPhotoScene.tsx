import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameContext";
import { PhotoStoryBackdrop } from "../story-photo/PhotoStoryBackdrop";
import {
  MapUnlockPanel,
  MemoryCompletePanel,
  PhotoStoryDialogue,
  ProfilePanel,
} from "../story-photo/PhotoStoryPanels";
import { PHOTO_STORY_BEATS, type PhotoBeat, type PhotoSceneId } from "../story-photo/photoStoryBeats";
import type { Scene4Phase } from "../story-photo/SceneSingapore";
import type { Scene6Drift } from "../story-photo/ScenePath";
import "../story-photo/photo-story.css";

type OverlayKind = "profile" | "map-imu" | "map-ntu" | "complete" | null;

const SCENE3_RAW_LINE = "如果故事可以被写出来，为什么不能被走进去？";
const SCENE3_SHOWROOM_LINE = "于是，她走进了展览展示行业。";
const SCENE4_SG_LINE = "两年多以后，她又一次不满足于已经熟悉的答案。";
const SCENE4_NTU_LINE = "所以，她选择重新回到学校。";
const SCENE4_LEARN_LINE = "如果一个人知道自己不知道什么，她可以去学习。";
const SCENE4_UNKNOWN_LINE = "可如果一个人连自己不知道什么都不知道呢？";
const SCENE4_WORLD_LINE = "当世界变得足够大，她就再也没办法对那些未知视而不见。";
const SCENE4_KNOW_READY_MS = 2100;
const SCENE5_LAST_LINE = "比起知道答案，她开始更喜欢创造新的可能。";
const SCENE6_LINE_1 = "她已经走出了很远。";
const SCENE6_LINE_2 = "但她似乎还没打算停下来。";
const SCENE6_LINE_OUT_MS = 350;
const SCENE6_PUSH_MS = 1500;
const SCENE6_PUNCH_MS = 520;
const SCENE6_BLACK_IN_MS = 440;
const SCENE6_BLACK_HOLD_MS = 160;
const SCENE6_BLACK_OUT_MS = 520;
const SCENE6_SETTLE_MS = 900;
const SCENE6_HOLD_MS = 900;

export function StoryPhotoScene() {
  const { completePhotoStory, goToScene, photoStoryComplete } = useGame();
  const isReplay = useRef(photoStoryComplete).current;
  const [step, setStep] = useState(-1);
  const [scene, setScene] = useState<PhotoSceneId>(1);
  const [grasslandReveal, setGrasslandReveal] = useState(false);
  const [openingPhoto, setOpeningPhoto] = useState(true);
  const [galleryStage, setGalleryStage] = useState(0);
  const [digitalLevel, setDigitalLevel] = useState(0);
  const [showPhotoPath, setShowPhotoPath] = useState(false);
  const [outgoingScene, setOutgoingScene] = useState<PhotoSceneId | null>(null);
  const [overlay, setOverlay] = useState<OverlayKind>(null);
  const [lineText, setLineText] = useState<string | null>(null);
  const [geoPhase, setGeoPhase] = useState<"enter" | "hold" | "exit" | null>(null);
  const [scene3Showroom, setScene3Showroom] = useState(false);
  const [scene3Lock, setScene3Lock] = useState(false);
  const [scene3Light, setScene3Light] = useState<0 | 1 | 2>(0);
  const [scene4Phase, setScene4Phase] = useState<Scene4Phase>("sg");
  const [scene4Lock, setScene4Lock] = useState(false);
  const [scene6Cam, setScene6Cam] = useState<"idle" | "push" | "punch" | "path">("idle");
  const [scene6Drift, setScene6Drift] = useState<Scene6Drift>(0);
  const [scene6Lock, setScene6Lock] = useState(false);
  const [scene6Through, setScene6Through] = useState(false);
  const [dialogueOut, setDialogueOut] = useState(false);
  const [scene6LineIn, setScene6LineIn] = useState(false);
  const [scene6Black, setScene6Black] = useState<"in" | "hold" | "out" | null>(null);
  const [scene6PathHold, setScene6PathHold] = useState(false);

  const scene2LineCount =
    step < 0
      ? 0
      : PHOTO_STORY_BEATS.slice(0, step + 1).filter(
          (beat) => beat.kind === "line" && beat.scene === 2,
        ).length;

  const scene5LineCount =
    step < 0
      ? 0
      : PHOTO_STORY_BEATS.slice(0, step + 1).filter(
          (beat) => beat.kind === "line" && beat.scene === 5,
        ).length;

  const applyBeat = useCallback((beat: PhotoBeat) => {
    switch (beat.kind) {
      case "reveal":
        setOpeningPhoto(false);
        setGrasslandReveal(true);
        setLineText(null);
        break;
      case "line":
        setScene(beat.scene);
        setLineText(beat.text);
        break;
      case "profile":
        setOverlay("profile");
        setLineText(null);
        break;
      case "mapUnlock":
        setOverlay(beat.variant === "imu" ? "map-imu" : "map-ntu");
        setLineText(null);
        break;
      case "galleryStage":
        setGalleryStage(beat.stage);
        setLineText(null);
        break;
      case "digital":
        setDigitalLevel(beat.level);
        setLineText(null);
        break;
      case "photoPath":
        setShowPhotoPath(true);
        setLineText(null);
        break;
      case "memoryComplete":
        if (!isReplay) {
          setOverlay("complete");
          setLineText(null);
        }
        break;
      case "flip":
        setLineText(null);
        break;
    }
  }, []);

  useEffect(() => {
    if (step < 0) return;
    const beat = PHOTO_STORY_BEATS[step];
    if (!beat) return;

    applyBeat(beat);

    if (beat.kind === "flip") {
      setOutgoingScene(scene);
      if (beat.scene === 3) {
        setGeoPhase("enter");
        setScene(3);
        setLineText("但后来，她发现自己开始不满足于只是讲述故事。");
        const enterId = window.setTimeout(() => {
          setGeoPhase("hold");
          setOutgoingScene(null);
        }, 800);
        const exitId = window.setTimeout(() => setGeoPhase("exit"), 11800);
        const doneId = window.setTimeout(() => {
          setGeoPhase(null);
          setOutgoingScene(null);
          setScene3Showroom(false);
          setScene3Light(0);
          setStep(
            PHOTO_STORY_BEATS.findIndex(
              (b) => b.kind === "line" && b.text === SCENE3_RAW_LINE,
            ),
          );
        }, 12600);
        return () => {
          window.clearTimeout(enterId);
          window.clearTimeout(exitId);
          window.clearTimeout(doneId);
        };
      }
      if (beat.scene === 4) {
        setScene4Phase("sg");
        setScene4Lock(false);
      }
      setScene(beat.scene);
      const fadeMs = beat.scene === 5 ? 1400 : 800;
      const id = window.setTimeout(() => {
        setOutgoingScene(null);
        setStep((s) => s + 1);
      }, fadeMs);
      return () => window.clearTimeout(id);
    }
  }, [step, applyBeat]);

  useEffect(() => {
    if (!scene3Showroom || !scene3Lock) return;
    const id = window.setTimeout(() => {
      setLineText(SCENE3_SHOWROOM_LINE);
      setScene3Lock(false);
      window.setTimeout(() => setScene3Light(1), 500);
    }, 1400);
    return () => window.clearTimeout(id);
  }, [scene3Showroom, scene3Lock]);

  const onScene4SkyDone = useCallback(() => {
    setScene4Phase("ntu");
    setScene4Lock(false);
    setStep(
      PHOTO_STORY_BEATS.findIndex((b) => b.kind === "line" && b.text === SCENE4_NTU_LINE),
    );
  }, []);

  useEffect(() => {
    if (scene4Phase !== "to-knowledge") return;
    const id = window.setTimeout(() => setScene4Lock(false), SCENE4_KNOW_READY_MS);
    return () => window.clearTimeout(id);
  }, [scene4Phase]);

  useEffect(() => {
    if (!scene6Through) return;
    const t0 = SCENE6_LINE_OUT_MS;
    const t1 = t0 + SCENE6_PUSH_MS;
    const t2 = t1 + SCENE6_PUNCH_MS;
    const tSwap = t2 + SCENE6_BLACK_IN_MS;
    const tReveal = tSwap + SCENE6_BLACK_HOLD_MS;
    const tClear = tReveal + SCENE6_BLACK_OUT_MS;
    const tLine = tReveal + SCENE6_SETTLE_MS + SCENE6_HOLD_MS;
    const ids = [
      window.setTimeout(() => {
        setLineText(null);
        setDialogueOut(false);
        setScene6Cam("push");
      }, t0),
      window.setTimeout(() => setScene6Cam("punch"), t1),
      window.setTimeout(() => setScene6Black("in"), t2),
      window.setTimeout(() => {
        setScene(6);
        setScene6Cam("path");
        setScene6PathHold(true);
        setScene6Black("hold");
      }, tSwap),
      window.setTimeout(() => {
        setScene6PathHold(false);
        setScene6Black("out");
      }, tReveal),
      window.setTimeout(() => setScene6Black(null), tClear),
      window.setTimeout(() => {
        setScene6Drift(1);
        setScene6LineIn(true);
        setScene6Lock(false);
        setScene6Through(false);
        setStep(
          PHOTO_STORY_BEATS.findIndex((b) => b.kind === "line" && b.text === SCENE6_LINE_1),
        );
      }, tLine),
    ];
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [scene6Through]);

  const advance = () => {
    if (overlay || outgoingScene != null || geoPhase != null || scene3Lock || scene4Lock || scene6Lock) return;
    const beat = PHOTO_STORY_BEATS[step];
    if (beat?.kind === "memoryComplete") return;

    if (lineText === SCENE3_RAW_LINE && !scene3Showroom) {
      setScene3Showroom(true);
      setScene3Lock(true);
      return;
    }

    if (lineText === SCENE3_SHOWROOM_LINE) {
      setGalleryStage(3);
      setScene3Light(2);
      setStep(
        PHOTO_STORY_BEATS.findIndex(
          (b) => b.kind === "line" && b.text === "从观察故事，到参与创造故事。",
        ),
      );
      return;
    }

    if (lineText === SCENE4_SG_LINE && scene4Phase === "sg") {
      setScene4Phase("to-ntu");
      setScene4Lock(true);
      setLineText(null);
      return;
    }

    if (lineText === SCENE4_LEARN_LINE && scene4Phase === "ntu") {
      setScene4Phase("to-knowledge");
      setScene4Lock(true);
      setStep(
        PHOTO_STORY_BEATS.findIndex((b) => b.kind === "line" && b.text === SCENE4_UNKNOWN_LINE),
      );
      return;
    }

    if (lineText === SCENE4_UNKNOWN_LINE && scene4Phase === "to-knowledge") {
      setScene4Phase("knowledge");
      setStep(
        PHOTO_STORY_BEATS.findIndex((b) => b.kind === "line" && b.text === SCENE4_WORLD_LINE),
      );
      return;
    }

    if (lineText === SCENE5_LAST_LINE && scene === 5 && scene6Cam === "idle") {
      setScene6Lock(true);
      setDialogueOut(true);
      setScene6Through(true);
      return;
    }

    if (lineText === SCENE6_LINE_1) {
      setScene6Drift(2);
      setScene6LineIn(false);
    }

    if (lineText === SCENE6_LINE_2 && isReplay) {
      goToScene("hub");
      return;
    }

    if (step === -1) {
      setStep(0);
      return;
    }

    const next = step + 1;
    if (next >= PHOTO_STORY_BEATS.length) return;

    if (PHOTO_STORY_BEATS[next]?.kind === "flip") {
      setStep(next);
      return;
    }

    setStep(next);
  };

  const dismissOverlay = () => {
    setOverlay(null);
    setStep((s) => s + 1);
  };

  const finishStory = () => {
    if (!isReplay) completePhotoStory();
    goToScene("hub");
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[oklch(0.18_0.02_60)]">
      <button
        type="button"
        aria-label="继续"
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={advance}
      />

      <PhotoStoryBackdrop
        scene={scene}
        grasslandReveal={grasslandReveal}
        galleryStage={galleryStage}
        digitalLevel={digitalLevel}
        showPhotoPath={showPhotoPath}
        outgoingScene={outgoingScene}
        openingPhoto={openingPhoto}
        scene1Direction={(scene === 1 || outgoingScene === 1) && step >= 3}
        scene2Journalism={scene2LineCount >= 3}
        scene2MajorTip={scene2LineCount >= 2}
        geoPhase={geoPhase}
        scene3Showroom={scene3Showroom}
        scene3Light={scene3Light}
        scene4Phase={scene4Phase}
        onScene4SkyDone={onScene4SkyDone}
        scene5LineCount={scene5LineCount}
        scene6Cam={scene6Cam}
        scene6Drift={scene6Drift}
        scene6PathHold={scene6PathHold}
      />

      {scene6Black && (
        <div
          className={`pointer-events-none absolute inset-0 z-[15] bg-black ${
            scene6Black === "in"
              ? "ps-s6-black-in"
              : scene6Black === "out"
                ? "ps-s6-black-out"
                : "ps-s6-black-hold"
          }`}
        />
      )}

      {lineText && !overlay && (
        <div
          className={
            dialogueOut ? "ps-s6-dialogue-out" : scene6LineIn ? "ps-s6-dialogue-in" : undefined
          }
        >
          <PhotoStoryDialogue text={lineText} onAdvance={advance} />
        </div>
      )}

      {overlay === "profile" && <ProfilePanel onDismiss={dismissOverlay} />}
      {overlay === "map-imu" && (
        <MapUnlockPanel variant="imu" onDismiss={dismissOverlay} />
      )}
      {overlay === "map-ntu" && (
        <MapUnlockPanel variant="ntu" onDismiss={dismissOverlay} />
      )}
      {overlay === "complete" && <MemoryCompletePanel onFinish={finishStory} />}
    </div>
  );
}
