import { useCallback, useEffect, useRef, useState } from "react";
import starfieldArt from "@/assets/星空底图.png";
import { DialogueBox } from "../DialogueBox";
import "./telescope-story.css";

const TICKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as const;
const CARDINAL = new Set([0, 90, 180, 270]);

const INTRO_MS = 600;
const Q_GAP_MS = 650;
const AFTER_Q_MS = 700;
const COORD_GAP_MS = 450;
const TRACK_GAP_MS = 350;
const AFTER_TRACKS_MS = 900;
const DIRECTION_MS = 1050;
const TRACKING_HOLD_MS = 1400;
const CLEAR_MS = 900;
const SKY_MS = 700;

const VOID_DOTS = [
  { left: "16%", top: "22%" },
  { left: "28%", top: "38%" },
  { left: "22%", top: "68%" },
  { left: "48%", top: "18%" },
  { left: "54%", top: "46%" },
  { left: "62%", top: "72%" },
  { left: "74%", top: "28%" },
  { left: "78%", top: "58%" },
  { left: "38%", top: "78%" },
  { left: "70%", top: "14%" },
] as const;

const QUESTIONS = [
  { id: "q1", sys: "01", en: "WHO IS IT FOR?", zh: "为谁解决问题？" },
  { id: "q2", sys: "02", en: "CAN IT BECOME A PRODUCT?", zh: "能不能真正做成产品？" },
  { id: "q3", sys: "03", en: "WHAT CAN TECHNOLOGY CHANGE?", zh: "技术还能改变什么？" },
] as const;

const COORDS = ["HUMAN", "PRODUCT", "TECHNOLOGY"] as const;
const TRACKS = [
  { id: "ai-products", label: "AI PRODUCTS" },
  { id: "digital-experience", label: "DIGITAL EXPERIENCE" },
  { id: "human-ai-interaction", label: "HUMAN–AI INTERACTION" },
  { id: "intelligent-systems", label: "INTELLIGENT SYSTEMS" },
  { id: "emerging-tech", label: "EMERGING TECH" },
] as const;

const LINES = [
  { speaker: "", text: "具体的岗位会变。" },
  { speaker: "", text: "但她越来越清楚，自己想站在哪些问题的交界处。" },
];

/** Open triangle in lens % — HUMAN top, PRODUCT left, TECHNOLOGY right. */
const TRI = {
  human: { x: 50, y: 28 },
  product: { x: 26, y: 66 },
  tech: { x: 74, y: 66 },
} as const;

type Step =
  | "enter"
  | "questions"
  | "coords"
  | "dialogue"
  | "triangle"
  | "tracks"
  | "direction"
  | "tracking"
  | "starfield";

/** Telescope Story Future / Direction. Stops at starfield + TRACKING ACTIVE. */
export function TelescopeFuture({ onStarfieldReady }: { onStarfieldReady?: () => void } = {}) {
  const onStarfieldReadyRef = useRef(onStarfieldReady);
  onStarfieldReadyRef.current = onStarfieldReady;
  const [step, setStep] = useState<Step>("enter");
  const [qCount, setQCount] = useState(0);
  const [coordCount, setCoordCount] = useState(0);
  const [trackCount, setTrackCount] = useState(0);
  const [clearing, setClearing] = useState(false);
  const [starfield, setStarfield] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  const later = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(() => {
    later(INTRO_MS, () => {
      setStep("questions");
      setQCount(1);
    });
  }, [later]);

  useEffect(() => {
    if (step !== "questions") return;
    if (qCount < QUESTIONS.length) {
      const id = window.setTimeout(() => setQCount((n) => n + 1), Q_GAP_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => {
      setStep("coords");
      setCoordCount(1);
    }, AFTER_Q_MS);
    return () => window.clearTimeout(id);
  }, [step, qCount]);

  useEffect(() => {
    if (step !== "coords") return;
    if (coordCount < COORDS.length) {
      const id = window.setTimeout(() => setCoordCount((n) => n + 1), COORD_GAP_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setStep("dialogue"), 500);
    return () => window.clearTimeout(id);
  }, [step, coordCount]);

  useEffect(() => {
    if (step !== "tracks") return;
    if (trackCount < TRACKS.length) {
      const id = window.setTimeout(() => setTrackCount((n) => n + 1), TRACK_GAP_MS);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setStep("direction"), AFTER_TRACKS_MS);
    return () => window.clearTimeout(id);
  }, [step, trackCount]);

  useEffect(() => {
    if (step !== "direction") return;
    const id = window.setTimeout(() => setStep("tracking"), DIRECTION_MS);
    return () => window.clearTimeout(id);
  }, [step]);

  useEffect(() => {
    if (step !== "tracking") return;
    later(TRACKING_HOLD_MS, () => {
      setClearing(true);
      later(CLEAR_MS, () => {
        setStarfield(true);
        later(SKY_MS, () => {
          setStep("starfield");
          onStarfieldReadyRef.current?.();
        });
      });
    });
  }, [later, step]);

  const afterDialogue = () => {
    setStep("triangle");
    later(520, () => {
      setStep("tracks");
      setTrackCount(1);
    });
  };

  const dimQuestions = coordCount > 0;
  const status =
    step === "direction" ? "DIRECTION UPDATED" : step === "enter" || step === "questions" || step === "coords" || step === "dialogue" || step === "triangle" || step === "tracks" ? "FUTURE OBSERVATION" : "TRACKING ACTIVE";

  return (
    <div className="telescope-future">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="telescope-stage relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
          <div className={`telescope-future-void telescope-future-void-outer ${starfield ? "is-out" : ""}`} aria-hidden>
            {VOID_DOTS.map((dot) => (
              <i key={`${dot.left}-${dot.top}`} style={{ left: dot.left, top: dot.top }} />
            ))}
          </div>
          <img
            src={starfieldArt}
            alt=""
            width={1536}
            height={1024}
            draggable={false}
            className={`telescope-sky telescope-sky-outer telescope-future-sky-outer ${starfield ? "is-in" : ""}`}
          />
          <div className="telescope-sky-vignette" />

          <p className="telescope-label">TELESCOPE</p>

          <div className="telescope-scope-shell">
            <div className="telescope-outer-ring" />
            <div className="telescope-mechanical-ring">
              {TICKS.map((deg) => (
                <span
                  key={deg}
                  className={`telescope-tick ${CARDINAL.has(deg) ? "is-cardinal" : ""}`}
                  style={{ transform: `rotate(${deg}deg)` }}
                />
              ))}
            </div>
            <div className="telescope-inner-ring" />
            <div className="telescope-viewport" />
          </div>

          <div className="telescope-lens-overlay">
            <div className="telescope-future-lens">
              <img
                src={starfieldArt}
                alt=""
                width={1536}
                height={1024}
                draggable={false}
                className={`telescope-future-sky-in ${starfield ? "is-in" : ""}`}
              />
              {step !== "starfield" && (
                <div className={`telescope-future-void ${starfield ? "is-out" : ""}`} aria-hidden>
                  {VOID_DOTS.map((dot) => (
                    <i key={`in-${dot.left}-${dot.top}`} style={{ left: dot.left, top: dot.top }} />
                  ))}
                </div>
              )}
              {step !== "starfield" && (
                <div
                  className={`telescope-future-layer ${dimQuestions ? "is-dim-q" : ""} ${step === "triangle" || step === "tracks" || step === "direction" || step === "tracking" ? "is-triangle" : ""} ${clearing ? "is-clearing" : ""}`}
                >
                {QUESTIONS.slice(0, qCount).map((q) => (
                  <article key={q.id} className={`telescope-future-q is-${q.id}`}>
                    <p className="telescope-future-q-sys">{q.sys}</p>
                    <p className="telescope-future-q-en">{q.en}</p>
                    <p className="telescope-future-q-zh">{q.zh}</p>
                  </article>
                ))}

                {COORDS.slice(0, coordCount).map((id) => (
                  <p key={id} className={`telescope-future-coord is-${id.toLowerCase()}`}>
                    {id}
                  </p>
                ))}

                <svg
                  className="telescope-future-lines"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <line x1={TRI.human.x} y1={TRI.human.y} x2={TRI.product.x} y2={TRI.product.y} />
                  <line x1={TRI.product.x} y1={TRI.product.y} x2={TRI.tech.x} y2={TRI.tech.y} />
                  <line x1={TRI.tech.x} y1={TRI.tech.y} x2={TRI.human.x} y2={TRI.human.y} />
                </svg>

                {trackCount > 0 && <p className="telescope-future-tracks-title">ACTIVE TRACKS</p>}
                {TRACKS.slice(0, trackCount).map((track) => (
                  <p key={track.id} className={`telescope-future-track is-${track.id}`}>
                    {track.label}
                  </p>
                ))}
              </div>
              )}
            </div>
            <div className="telescope-lens-vignette" />
          </div>

          <p
            className={`telescope-status is-held ${step === "direction" ? "is-direction" : ""} ${status === "TRACKING ACTIVE" ? "is-tracking" : ""}`}
          >
            {status}
          </p>
        </div>
      </div>

      {step === "dialogue" && (
        <div className="telescope-dialogue">
          <DialogueBox lines={LINES} onFinish={afterDialogue} />
        </div>
      )}
    </div>
  );
}
