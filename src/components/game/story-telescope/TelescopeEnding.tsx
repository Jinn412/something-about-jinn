import { useEffect, useRef, useState } from "react";
import endingArt from "@/assets/telescopeEnding.png";
import { DialogueBox } from "../DialogueBox";
import "./telescope-story.css";

const HOLD_MS = 800;
const STATUS_FADE_MS = 500;
const AFTER_STATUS_MS = 300;
const BLINK1_CLOSE_MS = 300;
const BLINK1_OPEN_MS = 350;
const AFTER_BLINK1_MS = 650;
const BLINK2_CLOSE_MS = 700;
const CLOSED_HOLD_MS = 300;
const BLACKOUT_MS = 800;
const BLACK_HOLD_MS = 900;
const ART_FADE_MS = 1500;
const AFTER_REVEAL_MS = 800;

const LAST_LINE = [
  { speaker: "", text: "接下来，她想用真正做出来的东西继续回答这些问题。" },
] as const;

type EndingStep =
  | "hold"
  | "status-out"
  | "pause"
  | "blink-one-close"
  | "blink-one-open"
  | "pause-after-blink"
  | "blink-two-close"
  | "blackout"
  | "black-hold"
  | "ending-reveal"
  | "done";

const ENDING_NEXT: Partial<Record<EndingStep, { to: EndingStep; ms: number }>> = {
  hold: { to: "status-out", ms: HOLD_MS },
  "status-out": { to: "pause", ms: STATUS_FADE_MS },
  pause: { to: "blink-one-close", ms: AFTER_STATUS_MS },
  "blink-one-close": { to: "blink-one-open", ms: BLINK1_CLOSE_MS },
  "blink-one-open": { to: "pause-after-blink", ms: BLINK1_OPEN_MS },
  "pause-after-blink": { to: "blink-two-close", ms: AFTER_BLINK1_MS },
  "blink-two-close": { to: "blackout", ms: BLINK2_CLOSE_MS + CLOSED_HOLD_MS },
  blackout: { to: "black-hold", ms: BLACKOUT_MS },
  "black-hold": { to: "ending-reveal", ms: BLACK_HOLD_MS },
  "ending-reveal": { to: "done", ms: ART_FADE_MS },
};

const LIDS_SHUT = new Set<EndingStep>(["blink-one-close", "blink-two-close", "blackout"]);
const SHOW_BLINK = new Set<EndingStep>([
  "hold",
  "status-out",
  "pause",
  "blink-one-close",
  "blink-one-open",
  "pause-after-blink",
  "blink-two-close",
  "blackout",
]);

function lidDuration(step: EndingStep) {
  if (step === "blink-two-close") return BLINK2_CLOSE_MS;
  if (step === "blink-one-open") return BLINK1_OPEN_MS;
  return BLINK1_CLOSE_MS;
}

/** Visual ending, then the last line. Completion happens after the player clicks. */
export function TelescopeEnding({
  onBlackout,
  onScopeGone,
  onVisualComplete,
  onLastLine,
}: {
  onBlackout?: () => void;
  onScopeGone?: () => void;
  onVisualComplete?: () => void;
  onLastLine?: () => void;
}) {
  const [step, setStep] = useState<EndingStep>("hold");
  const [visualEndingComplete, setVisualEndingComplete] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const onBlackoutRef = useRef(onBlackout);
  const onScopeGoneRef = useRef(onScopeGone);
  const onVisualCompleteRef = useRef(onVisualComplete);
  const onLastLineRef = useRef(onLastLine);
  onBlackoutRef.current = onBlackout;
  onScopeGoneRef.current = onScopeGone;
  onVisualCompleteRef.current = onVisualComplete;
  onLastLineRef.current = onLastLine;

  useEffect(() => {
    const next = ENDING_NEXT[step];
    if (!next) return;
    const id = window.setTimeout(() => setStep(next.to), next.ms);
    return () => window.clearTimeout(id);
  }, [step]);

  useEffect(() => {
    if (step !== "blackout") return;
    onBlackoutRef.current?.();
    const id = window.setTimeout(() => onScopeGoneRef.current?.(), BLACKOUT_MS);
    return () => window.clearTimeout(id);
  }, [step]);

  useEffect(() => {
    if (step !== "done") return;
    setVisualEndingComplete(true);
    onVisualCompleteRef.current?.();
    const id = window.setTimeout(() => setShowLine(true), AFTER_REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [step]);

  const lidsShut = LIDS_SHUT.has(step);
  const showBlink = SHOW_BLINK.has(step);

  return (
    <div
      className={`telescope-ending${lidsShut ? " is-lids-shut" : ""}${step === "blackout" || step === "black-hold" ? " is-black" : ""}${step === "ending-reveal" || step === "done" ? " is-reveal" : ""}`}
      data-step={step}
      data-complete={visualEndingComplete ? "true" : "false"}
      style={{
        ["--te-lid" as string]: `${lidDuration(step)}ms`,
        ["--te-black" as string]: `${BLACKOUT_MS}ms`,
        ["--te-art" as string]: `${ART_FADE_MS}ms`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="telescope-stage relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
          <img
            src={endingArt}
            alt=""
            width={1536}
            height={1024}
            draggable={false}
            className="telescope-ending-art"
          />
          {showBlink && (
            <div className="telescope-ending-blink" aria-hidden>
              <span className="telescope-ending-lid is-top" />
              <span className="telescope-ending-lid is-bottom" />
            </div>
          )}
        </div>
      </div>
      <div className="telescope-ending-black" aria-hidden />
      {showLine && (
        <div className="telescope-dialogue telescope-ending-dialogue">
          <DialogueBox lines={[...LAST_LINE]} onFinish={() => onLastLineRef.current?.()} />
        </div>
      )}
    </div>
  );
}
