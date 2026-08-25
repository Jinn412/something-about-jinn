import { useCallback, useEffect, useRef, useState } from "react";
import lateNightArt from "@/assets/T4bg.png";
import { DialogueBox } from "../DialogueBox";
import { TelescopePanViewport, type PanTarget } from "./TelescopePanViewport";
import "./telescope-story.css";

const TICKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as const;
const CARDINAL = new Set([0, 90, 180, 270]);

const EXPLORATION_SCALE = 1.25;
const TARGET_FOCUS_SCALE = 1.45;
const ACQUIRE_RADIUS = 0.26;
const HINT_FIRST_MS = 7000;
const HINT_AGAIN_MS = 6000;
const FOCUS_MS = 600;
const RESTORE_MS = 550;
const AFTER_FOCUS_HOLD_MS = 200;
const AFTER_OBS_MS = 280;
const AFTER_RESTORE_MS = 300;
const ASK_WORD_MS = 300;
const TRY_HOLD_MS = [800, 1100, 900, 900, 1100, 1200] as const;
const TRY_FADE_MS = 150;
const TRY_AFTER_LAST_MS = 380;
const BUILD_RUNNING_MS = 500;
const OVERLAY_FADE_MS = 280;

const ASK: PanTarget = { id: "ask", x: 21, y: 52 };
const TRY: PanTarget = { id: "try", x: 50, y: 42 };
const BUILD: PanTarget = { id: "build", x: 78, y: 40 };

const ASK_WORDS = ["START SMALL", "DEFINE", "BUILD", "TEST"] as const;
const TRY_STEPS = ["RUN", "ERROR", "REVISE", "RUN AGAIN", "ERROR", "TRY AGAIN"] as const;

const ASK_LINE = [{ speaker: "", text: "她开始把‘我不会’，换成‘我该从哪里开始’。" }];
const TRY_LINE = [
  { speaker: "", text: "不会的，就边做边补。" },
  { speaker: "", text: "先验证它能不能成立。" },
  { speaker: "", text: "再决定哪里值得继续优化。" },
];
const BUILD_LINES = [
  { speaker: "", text: "第一个版本很粗糙。" },
  { speaker: "", text: "但它真的跑起来了。" },
];

type Phase =
  | "search-ask"
  | "lock-ask"
  | "ask-overlay"
  | "ask-line"
  | "restore-ask"
  | "search-try"
  | "lock-try"
  | "try-seq"
  | "try-line"
  | "restore-try"
  | "search-build"
  | "lock-build"
  | "build-overlay"
  | "build-line"
  | "restore-build"
  | "complete";

/** Telescope Story T4: LATE NIGHT / BUILDING. ASK → TRY → BUILD, then free browse. */
export function TelescopeLateNight({ onContinue }: { onContinue?: () => void }) {
  const [phase, setPhase] = useState<Phase>("search-ask");
  const [status, setStatus] = useState("SEARCHING...");
  const [viewScale, setViewScale] = useState(EXPLORATION_SCALE);
  const [focusTarget, setFocusTarget] = useState<PanTarget | null>(null);
  const [reticleHot, setReticleHot] = useState(false);
  const [hintKey, setHintKey] = useState(0);
  const [near, setNear] = useState(false);
  const [askWordCount, setAskWordCount] = useState(0);
  const [tryStep, setTryStep] = useState(-1);
  const [tryStepLeaving, setTryStepLeaving] = useState(false);
  const [showRunning, setShowRunning] = useState(false);
  const [overlayFading, setOverlayFading] = useState(false);
  const timers = useRef<number[]>([]);
  const completed = useRef(new Set<string>());
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

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

  const searching = phase === "search-ask" || phase === "search-try" || phase === "search-build";
  const focusing = phase === "lock-ask" || phase === "lock-try" || phase === "lock-build";
  const restoring = phase === "restore-ask" || phase === "restore-try" || phase === "restore-build";
  const panEnabled = searching || phase === "complete";
  const acquireEnabled = searching;

  useEffect(() => {
    if (!searching) return;
    const a = window.setTimeout(() => setHintKey((k) => k + 1), HINT_FIRST_MS);
    const b = window.setTimeout(() => setHintKey((k) => k + 1), HINT_FIRST_MS + HINT_AGAIN_MS);
    timers.current.push(a, b);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [searching, phase]);

  const beginFocus = useCallback((target: PanTarget) => {
    setFocusTarget(target);
    setViewScale(TARGET_FOCUS_SCALE);
    setReticleHot(true);
    setStatus("TARGET ACQUIRED");
    setOverlayFading(false);
  }, []);

  const restoreExploration = useCallback(() => {
    setFocusTarget(null);
    setViewScale(EXPLORATION_SCALE);
  }, []);

  const onAcquire = useCallback(
    (id: string) => {
      if (completed.current.has(id)) return;
      const now = phaseRef.current;
      if (id === "ask" && now === "search-ask") {
        completed.current.add("ask");
        setPhase("lock-ask");
        beginFocus(ASK);
        later(FOCUS_MS, () => {
          setReticleHot(false);
          later(AFTER_FOCUS_HOLD_MS, () => {
            setStatus("OBSERVATION 01");
            setAskWordCount(0);
            later(AFTER_OBS_MS, () => setPhase("ask-overlay"));
          });
        });
      }
      if (id === "try" && now === "search-try") {
        completed.current.add("try");
        setPhase("lock-try");
        beginFocus(TRY);
        later(FOCUS_MS, () => {
          setReticleHot(false);
          later(AFTER_FOCUS_HOLD_MS, () => {
            setStatus("OBSERVATION 02");
            setTryStepLeaving(false);
            setTryStep(0);
            later(AFTER_OBS_MS, () => setPhase("try-seq"));
          });
        });
      }
      if (id === "build" && now === "search-build") {
        completed.current.add("build");
        setPhase("lock-build");
        beginFocus(BUILD);
        later(FOCUS_MS, () => {
          setReticleHot(false);
          later(AFTER_FOCUS_HOLD_MS, () => {
            setStatus("OBSERVATION 03");
            setShowRunning(false);
            later(AFTER_OBS_MS, () => setPhase("build-overlay"));
          });
        });
      }
    },
    [beginFocus, later],
  );

  useEffect(() => {
    if (phase !== "ask-overlay") return;
    if (askWordCount >= ASK_WORDS.length) {
      const id = window.setTimeout(() => setPhase("ask-line"), 250);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setAskWordCount((n) => n + 1), ASK_WORD_MS);
    return () => window.clearTimeout(id);
  }, [phase, askWordCount]);

  useEffect(() => {
    if (phase !== "try-seq") return;
    if (tryStep < 0) return;
    const hold = TRY_HOLD_MS[tryStep] ?? 900;
    if (tryStep >= TRY_STEPS.length - 1) {
      const id = window.setTimeout(() => setPhase("try-line"), hold + TRY_AFTER_LAST_MS);
      return () => window.clearTimeout(id);
    }
    const leaveId = window.setTimeout(() => setTryStepLeaving(true), Math.max(0, hold - TRY_FADE_MS));
    const nextId = window.setTimeout(() => {
      setTryStepLeaving(false);
      setTryStep((n) => n + 1);
    }, hold);
    return () => {
      window.clearTimeout(leaveId);
      window.clearTimeout(nextId);
    };
  }, [phase, tryStep]);

  useEffect(() => {
    if (phase !== "build-overlay") return;
    const a = window.setTimeout(() => setShowRunning(true), BUILD_RUNNING_MS);
    const b = window.setTimeout(() => setPhase("build-line"), BUILD_RUNNING_MS + 400);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [phase]);

  const finishObservation = (restore: Phase, nextSearch: Phase, reset?: () => void) => {
    setOverlayFading(true);
    later(OVERLAY_FADE_MS, () => {
      reset?.();
      setPhase(restore);
      restoreExploration();
      later(RESTORE_MS, () => {
        later(AFTER_RESTORE_MS, () => {
          setStatus("SEARCHING...");
          setPhase(nextSearch);
        });
      });
    });
  };

  const afterAsk = () =>
    finishObservation("restore-ask", "search-try", () => setAskWordCount(0));

  const afterTry = () =>
    finishObservation("restore-try", "search-build", () => {
      setTryStepLeaving(false);
      setTryStep(-1);
    });

  const afterBuild = () => {
    setOverlayFading(true);
    later(OVERLAY_FADE_MS, () => {
      setPhase("restore-build");
      restoreExploration();
      later(RESTORE_MS, () => {
        later(AFTER_RESTORE_MS, () => {
          setStatus("SEARCHING...");
          setPhase("complete");
        });
      });
    });
  };

  const searchTarget =
    phase === "search-ask" ? ASK : phase === "search-try" ? TRY : phase === "search-build" ? BUILD : null;
  const motionMs = restoring ? RESTORE_MS : FOCUS_MS;

  const showAskOverlay =
    phase === "ask-overlay" || phase === "ask-line" || (overlayFading && phase === "restore-ask");
  const showTryOverlay =
    phase === "try-seq" || phase === "try-line" || (overlayFading && phase === "restore-try");
  const showBuildOverlay =
    phase === "build-overlay" || phase === "build-line" || (overlayFading && phase === "restore-build");

  const tryLabel = tryStep >= 0 ? TRY_STEPS[tryStep] : "";
  const tryIsError = tryLabel === "ERROR";

  return (
    <div className="telescope-late-night">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="telescope-stage relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
          <img
            src={lateNightArt}
            alt=""
            width={1536}
            height={1024}
            draggable={false}
            className="telescope-t4-outer"
          />
          <div className="telescope-sky-vignette" />

          <p className="telescope-label">TELESCOPE / 04</p>

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

          <div className={`telescope-lens-overlay ${reticleHot ? "is-hot" : ""} ${near ? "is-near" : ""}`}>
            <TelescopePanViewport
              src={lateNightArt}
              viewScale={viewScale}
              panEnabled={panEnabled}
              acquireEnabled={acquireEnabled}
              activeTarget={searchTarget}
              focusTarget={focusTarget}
              animateMotion={focusing || restoring}
              motionMs={motionMs}
              acquireRadius={ACQUIRE_RADIUS}
              hintKey={hintKey}
              onAcquire={onAcquire}
              onProximity={setNear}
            >
              {showAskOverlay && (
                <div className={`telescope-t4-ask ${overlayFading ? "is-fading" : ""}`}>
                  <p className="telescope-t4-ask-kicker">USER</p>
                  <p className="telescope-t4-ask-q">不会写代码，也能开始做一个产品吗？</p>
                  <ul className="telescope-t4-ask-words">
                    {ASK_WORDS.slice(0, askWordCount).map((word) => (
                      <li key={word}>{word}</li>
                    ))}
                  </ul>
                </div>
              )}
              {showTryOverlay && tryLabel && (
                <div
                  key={tryStep}
                  className={`telescope-t4-try ${overlayFading ? "is-fading" : ""} ${tryStepLeaving ? "is-step-leaving" : ""}`}
                >
                  <p className={`telescope-t4-try-step ${tryIsError ? "is-error" : ""}`}>{tryLabel}</p>
                </div>
              )}
              {showBuildOverlay && (
                <div className={`telescope-t4-build ${overlayFading ? "is-fading" : ""}`}>
                  <p className="telescope-t4-build-proto">PROTOTYPE 01</p>
                  {showRunning && (
                    <p className="telescope-t4-build-run">
                      <i />
                      RUNNING
                    </p>
                  )}
                </div>
              )}
            </TelescopePanViewport>
            <div className="telescope-lens-vignette" />
          </div>

          <p className={`telescope-status ${status !== "SEARCHING..." ? "is-held" : ""}`}>{status}</p>
          {phase === "complete" && onContinue && (
            <div className="telescope-next-continue">
              <button type="button" className="pixel-btn telescope-continue" onClick={onContinue}>
                继续观测
              </button>
            </div>
          )}
        </div>
      </div>

      {phase === "ask-line" && (
        <div className="telescope-dialogue">
          <DialogueBox lines={ASK_LINE} onFinish={afterAsk} />
        </div>
      )}
      {phase === "try-line" && (
        <div className="telescope-dialogue">
          <DialogueBox lines={TRY_LINE} onFinish={afterTry} />
        </div>
      )}
      {phase === "build-line" && (
        <div className="telescope-dialogue">
          <DialogueBox lines={BUILD_LINES} onFinish={afterBuild} />
        </div>
      )}
    </div>
  );
}
