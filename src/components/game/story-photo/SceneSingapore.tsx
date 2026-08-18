import { useEffect, useState } from "react";
import sgArt from "@/assets/sg.png";
import ntuArt from "@/assets/ntu.png";
import knowledgeArt from "@/assets/knowledge.png";

const SCENE_W = 1536;
const SCENE_H = 1024;

const LOOK_UP_MS = 2200;
const SKY_FADE_MS = 1200;
const LOOK_DOWN_MS = 2200;

export type Scene4Phase = "sg" | "to-ntu" | "ntu" | "to-knowledge" | "knowledge";

export function SceneSingapore({
  phase,
  settled,
  onSkyTransitionDone,
}: {
  phase: Scene4Phase;
  settled: boolean;
  onSkyTransitionDone: () => void;
}) {
  const [sgPush, setSgPush] = useState(false);
  const [lookUp, setLookUp] = useState(false);
  const [fading, setFading] = useState(false);
  const [lookDown, setLookDown] = useState(false);
  const [ntuPush, setNtuPush] = useState(false);

  useEffect(() => {
    if (!settled || phase !== "sg") return;
    const id = window.setTimeout(() => setSgPush(true), 600);
    return () => window.clearTimeout(id);
  }, [settled, phase]);

  useEffect(() => {
    if (phase !== "to-ntu") return;
    setLookUp(true);
    const fadeId = window.setTimeout(() => setFading(true), LOOK_UP_MS);
    const downId = window.setTimeout(() => setLookDown(true), LOOK_UP_MS + SKY_FADE_MS);
    const doneId = window.setTimeout(onSkyTransitionDone, LOOK_UP_MS + SKY_FADE_MS + LOOK_DOWN_MS);
    return () => {
      window.clearTimeout(fadeId);
      window.clearTimeout(downId);
      window.clearTimeout(doneId);
    };
  }, [phase, onSkyTransitionDone]);

  useEffect(() => {
    if (phase !== "ntu") return;
    const id = window.setTimeout(() => setNtuPush(true), 500);
    return () => window.clearTimeout(id);
  }, [phase]);

  const intoKnowledge = phase === "to-knowledge" || phase === "knowledge";
  const showSg = phase === "sg" || (phase === "to-ntu" && !lookDown);
  const showNtu = !intoKnowledge
    ? fading || lookDown || phase === "ntu"
    : phase === "to-knowledge";
  const showKnowledge = intoKnowledge;
  const showAmbient = phase === "knowledge";

  const sgCam = lookUp ? "ps-s4-sg-look-up" : sgPush ? "ps-s4-sg-push" : "";
  const ntuCam = intoKnowledge
    ? "ps-s4-ntu-into"
    : phase === "ntu"
      ? ntuPush
        ? "ps-s4-ntu-push"
        : ""
      : lookDown
        ? "ps-s4-ntu-look-down"
        : "ps-s4-ntu-from-sky";

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full overflow-hidden">
          {showSg && (
            <div className={`absolute inset-0${sgCam ? ` ${sgCam}` : ""}`}>
              <div className={`absolute inset-0${fading ? " ps-s4-sky-out" : ""}`}>
                <img
                  src={sgArt}
                  alt=""
                  width={SCENE_W}
                  height={SCENE_H}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </div>
            </div>
          )}
          {showNtu && (
            <div className={`absolute inset-0${ntuCam ? ` ${ntuCam}` : ""}`}>
              <div
                className={`absolute inset-0${fading && !lookDown && !intoKnowledge ? " ps-s4-sky-in" : ""}${
                  phase === "to-knowledge" ? " ps-s4-know-out" : ""
                }`}
              >
                <img
                  src={ntuArt}
                  alt=""
                  width={SCENE_W}
                  height={SCENE_H}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </div>
            </div>
          )}
          {showKnowledge && (
            <div className="absolute inset-0">
              <div
                className={`absolute inset-0${phase === "to-knowledge" ? " ps-s4-know-in" : ""}`}
              >
                <img
                  src={knowledgeArt}
                  alt=""
                  width={SCENE_W}
                  height={SCENE_H}
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-cover object-center${
                    showAmbient ? " ps-s4-know-ambient" : ""
                  }`}
                />
                {showAmbient && (
                  <>
                    <div
                      className="pointer-events-none absolute ps-s4-know-screen"
                      style={{ left: "7%", top: "7%", width: "22%", height: "18%" }}
                    />
                    <div
                      className="pointer-events-none absolute ps-s4-know-screen"
                      style={{
                        left: "36%",
                        top: "10%",
                        width: "20%",
                        height: "16%",
                        animationDelay: "-2.4s",
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
