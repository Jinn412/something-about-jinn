import { useEffect, useState } from "react";
import grasslandBg from "@/assets/background.png";
import yurtSprite from "@/assets/bao.png";
import roadSprite from "@/assets/road.png";
import birdsSprite from "@/assets/birds.png";
import campusArt from "@/assets/campus.png";
import journalismArt from "@/assets/journalism.png";
import rawSpaceArt from "@/assets/rawspace.png";
import showroomArt from "@/assets/showroom.png";
import photoArt from "@/assets/photo-grassland.png";
import type { PhotoSceneId } from "./photoStoryBeats";
import { SceneToGuangzhou } from "./SceneToGuangzhou";
import { SceneSingapore, type Scene4Phase } from "./SceneSingapore";
import { SceneWorkshop } from "./SceneWorkshop";
import { ScenePath, type Scene6Drift } from "./ScenePath";

const SCENE_W = 1536;
const SCENE_H = 1024;

/** bao.png anchor in background.png coordinates (1536×1024), not viewport %. */
const BAO_SCENE = {
  left: "58%",
  bottom: "28%",
  width: "21%",
  height: "auto",
} as const;

/**
 * road.png is a 1536×1024 scene overlay. Content lives in the lower ~74% of the
 * canvas (opaque from y=270). Scaled so the far tip meets the grassland horizon
 * and the wide end stays on the foreground grass.
 */
const ROAD_SCENE = {
  left: "0%",
  bottom: "0%",
  width: "70%",
  height: "auto",
} as const;

/**
 * birds.png is a 1536×1024 overlay; flock bbox is ~20–87% x, ~20–60% y.
 * Scaled and lifted so the whole flock stays in the sky.
 */
const BIRDS_SCENE = {
  left: "14%",
  top: "7%",
  width: "58%",
  height: "auto",
} as const;

/** Three clip groups on the same birds.png canvas (near / mid / far). */
const BIRD_LAYERS = [
  { id: "near", clip: "inset(39% 62% 36% 17%)" },
  { id: "mid", clip: "inset(30% 35% 52% 39%)" },
  { id: "far", clip: "inset(16% 10% 68% 69%)" },
] as const;

interface PhotoStoryBackdropProps {
  scene: PhotoSceneId;
  grasslandReveal: boolean;
  openingPhoto: boolean;
  galleryStage: number;
  digitalLevel: number;
  showPhotoPath: boolean;
  outgoingScene: PhotoSceneId | null;
  scene1Direction: boolean;
  scene2Journalism: boolean;
  scene2MajorTip: boolean;
  geoPhase: "enter" | "hold" | "exit" | null;
  scene3Showroom: boolean;
  scene3Light: 0 | 1 | 2;
  scene4Phase: Scene4Phase;
  onScene4SkyDone: () => void;
  scene5LineCount: number;
  scene6Cam: "idle" | "push" | "punch" | "path";
  scene6Drift: Scene6Drift;
  scene6PathHold: boolean;
}

export function PhotoStoryBackdrop({
  scene,
  grasslandReveal,
  openingPhoto,
  galleryStage,
  digitalLevel,
  showPhotoPath,
  outgoingScene,
  scene1Direction,
  scene2Journalism,
  scene2MajorTip,
  geoPhase,
  scene3Showroom,
  scene3Light,
  scene4Phase,
  onScene4SkyDone,
  scene5LineCount,
  scene6Cam,
  scene6Drift,
  scene6PathHold,
}: PhotoStoryBackdropProps) {
  const layerClass = (id: PhotoSceneId) => {
    const leaving = outgoingScene === id;
    const entering = outgoingScene != null && scene === id;
    const fade45 = outgoingScene === 4 && scene === 5;
    if (leaving) {
      return fade45 && id === 4
        ? "absolute inset-0 z-[1] ps-s5-cross-out"
        : "absolute inset-0 z-[1] ps-scene-cross-out";
    }
    if (entering) {
      return fade45 && id === 5
        ? "absolute inset-0 z-0 ps-s5-cross-in"
        : "absolute inset-0 z-0 ps-scene-cross-in";
    }
    return "absolute inset-0";
  };

  const show = (id: PhotoSceneId) => scene === id || outgoingScene === id;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {show(1) && (
        <div className={layerClass(1)}>
          <Scene1Grassland
            grasslandReveal={grasslandReveal}
            openingPhoto={openingPhoto}
            showDirection={scene1Direction}
          />
        </div>
      )}
      {show(2) && (
        <div className={layerClass(2)}>
          <SceneCampus showJournalism={scene2Journalism} showMajorTip={scene2MajorTip} />
        </div>
      )}
      {show(3) && geoPhase !== "enter" && geoPhase !== "hold" && (
        <div
          className={
            geoPhase === "exit" ? "absolute inset-0 z-0 ps-scene-cross-in" : layerClass(3)
          }
        >
          <SceneGallery showShowroom={scene3Showroom} light={scene3Light} />
        </div>
      )}
      {geoPhase && (
        <div
          className={
            geoPhase === "enter"
              ? "absolute inset-0 z-0 ps-scene-cross-in"
              : geoPhase === "exit"
                ? "absolute inset-0 z-[1] ps-scene-cross-out"
                : "absolute inset-0"
          }
        >
          <SceneToGuangzhou />
        </div>
      )}
      {show(4) && (
        <div className={layerClass(4)}>
          <SceneSingapore
            phase={scene4Phase}
            settled={scene === 4 && outgoingScene == null}
            onSkyTransitionDone={onScene4SkyDone}
          />
        </div>
      )}
      {show(5) && (
        <div className={layerClass(5)}>
          <SceneWorkshop
            noteStage={
              scene5LineCount >= 3 ? 3 : scene5LineCount >= 2 ? 2 : scene5LineCount >= 1 ? 1 : 0
            }
            throughCam={
              scene6Cam === "push" || scene6Cam === "punch"
                ? scene6Cam
                : outgoingScene === 5 && scene === 6
                  ? "punch"
                  : "idle"
            }
          />
        </div>
      )}
      {show(6) && (
        <div className={layerClass(6)}>
          <ScenePath drift={scene6Drift} holdEnter={scene6PathHold} />
        </div>
      )}
    </div>
  );
}

function Scene1Grassland({
  grasslandReveal,
  openingPhoto,
  showDirection,
}: {
  grasslandReveal: boolean;
  openingPhoto: boolean;
  showDirection: boolean;
}) {
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          opacity: grasslandReveal ? 1 : 0,
          transition: "opacity 900ms steps(6,end)",
        }}
      >
        {/* Scene-aligned layer — 1536×1024 box shared by background / road / bao / birds */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
            <img
              src={grasslandBg}
              alt=""
              width={SCENE_W}
              height={SCENE_H}
              draggable={false}
              className="absolute inset-0 h-full w-full"
            />
            <img
              src={roadSprite}
              alt=""
              width={SCENE_W}
              height={SCENE_H}
              draggable={false}
              className={`pointer-events-none absolute ps-s1-road${showDirection ? " ps-s1-in" : ""}`}
              style={{
                left: ROAD_SCENE.left,
                bottom: ROAD_SCENE.bottom,
                width: ROAD_SCENE.width,
                height: ROAD_SCENE.height,
              }}
            />
            <img
              src={yurtSprite}
              alt=""
              width={SCENE_W}
              height={SCENE_H}
              draggable={false}
              className="absolute"
              style={{
                left: BAO_SCENE.left,
                bottom: BAO_SCENE.bottom,
                width: BAO_SCENE.width,
                height: BAO_SCENE.height,
              }}
            />
            {BIRD_LAYERS.map((layer) => (
              <div
                key={layer.id}
                className={`pointer-events-none absolute inset-0 ps-s1-birds-${layer.id}${showDirection ? " ps-s1-in" : ""}`}
              >
                <img
                  src={birdsSprite}
                  alt=""
                  width={SCENE_W}
                  height={SCENE_H}
                  draggable={false}
                  className="absolute"
                  style={{
                    left: BIRDS_SCENE.left,
                    top: BIRDS_SCENE.top,
                    width: BIRDS_SCENE.width,
                    height: BIRDS_SCENE.height,
                    clipPath: layer.clip,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {openingPhoto && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 p-8"
          style={{
            opacity: 1,
            transition: "opacity 800ms steps(6,end)",
            pointerEvents: "auto",
          }}
        >
          <div className="relative pixel-frame max-w-md p-3">
            <img src={photoArt} alt="蒙古包旧照片" className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}

function SceneGrassland({
  grasslandReveal,
  openingPhoto,
  showPhotoPath,
  photoArt: photoSrc,
}: {
  grasslandReveal: boolean;
  openingPhoto?: boolean;
  showPhotoPath: boolean;
  photoArt?: string;
}) {
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.72 0.06 240) 0%, oklch(0.82 0.05 220) 55%, oklch(0.58 0.08 145) 100%)",
          opacity: grasslandReveal || showPhotoPath ? 1 : 0,
          transition: "opacity 900ms steps(6,end)",
        }}
      />

      <div
        className="ps-cloud-layer absolute left-[8%] top-[12%] h-8 w-24 bg-white/85"
        style={{ opacity: grasslandReveal || showPhotoPath ? 1 : 0 }}
      />
      <div
        className="ps-cloud-layer absolute right-[14%] top-[18%] h-6 w-20 bg-white/70 [animation-delay:-9s]"
        style={{ opacity: grasslandReveal || showPhotoPath ? 1 : 0 }}
      />
      <div
        className="ps-bird absolute left-0 top-[22%] text-xs text-ink"
        style={{ opacity: grasslandReveal ? 1 : 0 }}
      >
        · ˇ ·
      </div>

      <div
        className="ps-grass-layer absolute bottom-0 left-0 right-0 h-[38%]"
        style={{
          opacity: grasslandReveal || showPhotoPath ? 1 : 0,
          background:
            "repeating-linear-gradient(90deg, oklch(0.48 0.1 145) 0 8px, oklch(0.52 0.11 150) 8px 16px)",
        }}
      />

      <div
        className="absolute bottom-[28%] left-1/2 -translate-x-1/2"
        style={{ opacity: grasslandReveal ? 1 : 0, transition: "opacity 700ms steps(6,end)" }}
      >
        <div className="mx-auto h-16 w-24 bg-parchment" />
        <div className="mx-auto -mt-2 h-0 w-0 border-x-[48px] border-b-[36px] border-x-transparent border-b-parchment-dark" />
      </div>

      {(openingPhoto || showPhotoPath) && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 p-8"
          style={{
            opacity: openingPhoto ? 1 : showPhotoPath ? 1 : 0,
            transition: "opacity 800ms steps(6,end)",
            pointerEvents: openingPhoto ? "auto" : "none",
          }}
        >
          <div className="relative pixel-frame max-w-md p-3">
            <img src={photoSrc ?? photoArt} alt="蒙古包旧照片" className="w-full" />
            {showPhotoPath && (
              <svg
                className="absolute bottom-[22%] left-[18%] h-[38%] w-[64%]"
                viewBox="0 0 200 80"
                aria-hidden
              >
                <path
                  d="M10 65 Q 60 55, 110 40 T 190 15"
                  fill="none"
                  stroke="oklch(0.55 0.12 55)"
                  strokeWidth="4"
                  strokeDasharray="120"
                  style={{ animation: "ps-path-draw 1.2s steps(8,end) forwards" }}
                />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SceneCampus({
  showJournalism,
  showMajorTip,
}: {
  showJournalism: boolean;
  showMajorTip: boolean;
}) {
  const [pushDone, setPushDone] = useState(false);
  const [crossfade, setCrossfade] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setPushDone(true), 3500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (showJournalism && pushDone) setCrossfade(true);
  }, [showJournalism, pushDone]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
          <div className={`absolute inset-0 ${crossfade ? "ps-scene-cross-out" : ""}`}>
            <img
              src={campusArt}
              alt=""
              width={SCENE_W}
              height={SCENE_H}
              draggable={false}
              className="absolute inset-0 h-full w-full ps-s2-campus-push"
            />
            {showMajorTip && (
              <div
                className="pointer-events-none absolute pixel-panel ps-s2-stat px-3 py-2 text-[10px] leading-5 md:px-4 md:text-xs md:leading-6"
                style={{ right: "4%", top: "12%" }}
              >
                本科 · 新闻学 · 211高校
              </div>
            )}
          </div>
          <img
            src={journalismArt}
            alt=""
            width={SCENE_W}
            height={SCENE_H}
            draggable={false}
            className={`pointer-events-none absolute inset-0 h-full w-full ${crossfade ? "ps-scene-cross-in" : "opacity-0"}`}
          />
        </div>
      </div>
    </div>
  );
}

function SceneGallery({
  showShowroom,
  light,
}: {
  showShowroom: boolean;
  light: 0 | 1 | 2;
}) {
  const scale = light >= 2 ? 1.03 : light >= 1 ? 1.02 : 1;
  const scaleMs = light >= 2 ? "4s" : "5.5s";

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full overflow-hidden">
          <div className={`absolute inset-0 ${showShowroom ? "ps-s3-raw-out" : ""}`}>
            <img
              src={rawSpaceArt}
              alt=""
              width={SCENE_W}
              height={SCENE_H}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
          <div
            className={`absolute inset-0 ${showShowroom ? "ps-s3-showroom-in" : "opacity-0"}`}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "50% 50%",
              transition: `transform ${scaleMs} ease-out`,
            }}
          >
            <img
              src={showroomArt}
              alt=""
              width={SCENE_W}
              height={SCENE_H}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div
              className={`pointer-events-none absolute ps-s3-glow-main${light >= 1 ? " is-on" : ""}`}
              style={{ left: "38%", top: "38%", width: "30%", height: "22%" }}
            />
            <div
              className={`pointer-events-none absolute ps-s3-glow-kiosk${light >= 2 ? " is-on" : ""}`}
              style={{ left: "14%", top: "34%", width: "7%", height: "22%" }}
            />
            <div
              className={`pointer-events-none absolute ps-s3-glow-kiosk${light >= 2 ? " is-on" : ""}`}
              style={{ left: "76%", top: "52%", width: "6%", height: "18%" }}
            />
            <div
              className={`pointer-events-none absolute ps-s3-glow-box${light >= 2 ? " is-on" : ""}`}
              style={{ left: "24.5%", top: "26%", width: "2.4%", height: "36%" }}
            />
            <div
              className={`pointer-events-none absolute ps-s3-glow-box${light >= 2 ? " is-on" : ""}`}
              style={{ left: "71.5%", top: "22%", width: "2.2%", height: "34%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneNtu({ digitalLevel }: { digitalLevel: number }) {
  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.75 0.08 220) 0%, oklch(0.68 0.1 160) 100%)",
        }}
      />
      <div className="absolute bottom-[30%] left-[8%] h-24 w-8 bg-wood" />
      <div className="absolute bottom-[30%] right-[10%] h-28 w-8 bg-wood" />
      <div className="absolute bottom-[22%] left-[20%] right-[18%] h-36 border-4 border-wood-dark bg-parchment/90" />
      <div className="absolute bottom-[26%] left-[24%] h-6 w-10 bg-plum/60" />

      {digitalLevel >= 1 && (
        <div className="absolute bottom-[42%] left-[28%] h-14 w-20 border-4 border-wood-dark bg-ink/80" />
      )}
      {digitalLevel >= 2 && (
        <>
          <div className="absolute bottom-[48%] left-[32%] h-8 w-12 bg-plum-light/90" />
          <div className="absolute bottom-[44%] right-[26%] h-12 w-16 border-4 border-wood bg-parchment/80" />
        </>
      )}
      {digitalLevel >= 3 && (
        <>
          <div className="absolute bottom-[52%] right-[30%] h-3 w-3 animate-pulse bg-parchment" />
          <div className="absolute bottom-[40%] left-[36%] text-[10px] text-parchment">▶</div>
        </>
      )}
    </div>
  );
}
