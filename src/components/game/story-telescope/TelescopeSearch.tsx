import { useEffect, useRef, useState, type CSSProperties } from "react";
import starfieldArt from "@/assets/星空底图.png";
import { DialogueBox } from "../DialogueBox";
import "./telescope-story.css";
import "./telescope-t1-mobile.css";

const HOLD_MS = 600;
const SLIDER_AFTER_MS = 300;
const FOCUS_START = 18;
const FOCUS_SUCCESS = 82;

const LINES = [
  { speaker: "", text: "暂时不设终点。" },
  { speaker: "", text: "先扩大搜索范围。" },
];

const SIGNALS = [
  { id: "DATA", left: "28%", top: "24%", weight: "mid", anchor: "left" },
  { id: "MEDIA", left: "53%", top: "16%", weight: "mid", anchor: "above" },
  { id: "AI", left: "47%", top: "45%", weight: "high", anchor: "right" },
  { id: "PRODUCT", left: "72%", top: "38%", weight: "mid", anchor: "right" },
  { id: "INTERACTION", left: "29%", top: "68%", weight: "mid", anchor: "left" },
  { id: "ROBOTICS", left: "70%", top: "72%", weight: "mid", anchor: "below" },
] as const;

const CONSTELLATION = [
  ["DATA", "AI"],
  ["MEDIA", "AI"],
  ["MEDIA", "PRODUCT"],
  ["AI", "INTERACTION"],
  ["PRODUCT", "ROBOTICS"],
  ["INTERACTION", "ROBOTICS"],
] as const;

function pct(value: string) {
  return Number.parseFloat(value);
}

const TICKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as const;
const CARDINAL = new Set([0, 90, 180, 270]);

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(t: number) {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function remap01(value: number, start: number, end: number) {
  return clamp01((value - start) / (end - start));
}

function focusLook(value: number) {
  const t = Math.min(1, Math.max(0, value / 100));
  return {
    blur: 10 * (1 - t),
    brightness: 0.75 + 0.3 * t,
    contrast: 0.9 + 0.15 * t,
  };
}

/** Signal labels follow focusValue only — not focusAcquired. Continuous, no step thresholds. */
function signalLook(value: number) {
  const t = Math.min(1, Math.max(0, value / 100));
  const eased = t * t * (3 - 2 * t);
  return {
    blur: 9 * (1 - t) ** 1.5,
    opacity: 0.16 + 0.84 * eased,
    contrast: 0.92 + 0.08 * t,
  };
}

/** Target stars lag keywords: still weak while labels are becoming readable. */
function starLook(value: number) {
  const eased = smoothstep(remap01(value, 26, 90));
  return {
    opacity: 0.15 + 0.85 * eased,
    scale: 0.8 + 0.2 * eased,
    brightness: 0.72 + 0.28 * eased,
    blur: 2.2 * (1 - eased),
  };
}

/** Constellation lines last: near 0 until ~46, then a continuous fade-in. */
function constellationLook(value: number) {
  return { opacity: smoothstep(remap01(value, 46, 94)) };
}

const CONSTELLATION_REVEAL_MS = 920;
const LEAVE_MS = 1120;

/** Telescope Story Scene 01: searching / focus. Stops at FOCUS ACQUIRED. */
export function TelescopeSearch({
  exiting = false,
  onContinue,
  onExited,
}: {
  exiting?: boolean;
  onContinue?: () => void;
  onExited?: () => void;
}) {
  const [showDialogue, setShowDialogue] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [focusValue, setFocusValue] = useState(FOCUS_START);
  const [acquired, setAcquired] = useState(false);
  const [constellationRevealing, setConstellationRevealing] = useState(false);
  const [constellationRevealed, setConstellationRevealed] = useState(false);
  const acquiredRef = useRef(false);
  const constellationRevealPlayedRef = useRef(false);
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => setShowDialogue(true), HOLD_MS);
    timers.current.push(id);
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    if (!stage || !viewport) return;

    const syncClip = () => {
      const s = stage.getBoundingClientRect();
      const v = viewport.getBoundingClientRect();
      if (s.width < 1 || s.height < 1) return;
      const cx = v.left + v.width / 2 - s.left;
      const cy = v.top + v.height / 2 - s.top;
      const r = Math.min(v.width, v.height) / 2;
      stage.style.setProperty("--telescope-lens-center-x", `${cx}px`);
      stage.style.setProperty("--telescope-lens-center-y", `${cy}px`);
      stage.style.setProperty("--telescope-lens-size", `${r}px`);
    };

    syncClip();
    const ro = new ResizeObserver(syncClip);
    ro.observe(stage);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const id = window.setTimeout(() => onExitedRef.current?.(), LEAVE_MS);
    return () => window.clearTimeout(id);
  }, [exiting]);

  const afterDialogue = () => {
    setShowDialogue(false);
    const id = window.setTimeout(() => setShowSlider(true), SLIDER_AFTER_MS);
    timers.current.push(id);
  };

  const onFocusChange = (raw: string) => {
    const next = Number(raw);
    setFocusValue(next);
    if (!acquiredRef.current && next >= FOCUS_SUCCESS) {
      acquiredRef.current = true;
      setAcquired(true);
    }
    if (!constellationRevealPlayedRef.current && next >= FOCUS_SUCCESS) {
      constellationRevealPlayedRef.current = true;
      setConstellationRevealing(true);
      const id = window.setTimeout(() => {
        setConstellationRevealing(false);
        setConstellationRevealed(true);
      }, CONSTELLATION_REVEAL_MS);
      timers.current.push(id);
    }
  };

  const look = focusLook(focusValue);
  const lensFilter = `blur(${look.blur}px) brightness(${look.brightness}) contrast(${look.contrast})`;
  const signals = signalLook(focusValue);
  const signalFilter = `blur(${signals.blur}px) contrast(${signals.contrast})`;
  const stars = starLook(focusValue);
  const constellation = constellationLook(focusValue);

  return (
    <div
      className={`telescope-search relative h-full w-full overflow-hidden ${exiting ? "is-leaving" : ""}`}
      style={{ "--ts-focus-t": String(clamp01(focusValue / 100)) } as CSSProperties}
    >
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          ref={stageRef}
          className="telescope-stage relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full"
        >
          <img
            src={starfieldArt}
            alt=""
            width={1536}
            height={1024}
            className="telescope-sky telescope-sky-outer"
          />
          <img
            src={starfieldArt}
            alt=""
            width={1536}
            height={1024}
            className="telescope-sky telescope-sky-focused"
            style={{ filter: lensFilter }}
          />
          <img
            src={starfieldArt}
            alt=""
            width={1536}
            height={1024}
            className="telescope-sky telescope-sky-focused telescope-sky-t1-clear"
            aria-hidden
          />
          <div className="telescope-sky-vignette" />

          <p className="telescope-label">TELESCOPE / 01</p>

          <div className={`telescope-scope-shell ${acquired ? "is-acquired" : ""}`}>
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
            <div className="telescope-viewport" ref={viewportRef} />
          </div>
          <div className="telescope-lens-overlay">
            <div className="telescope-signal-layer">
              <div className="telescope-signal-group">
                <svg
                  className={`telescope-constellation ${constellationRevealing ? "is-revealing" : ""} ${constellationRevealed ? "is-revealed" : ""}`}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden
                  style={{ opacity: constellation.opacity }}
                >
                  {CONSTELLATION.map(([fromId, toId]) => {
                    const from = SIGNALS.find((s) => s.id === fromId);
                    const to = SIGNALS.find((s) => s.id === toId);
                    if (!from || !to) return null;
                    return (
                      <line
                        key={`${fromId}-${toId}`}
                        x1={pct(from.left)}
                        y1={pct(from.top)}
                        x2={pct(to.left)}
                        y2={pct(to.top)}
                        pathLength={1}
                        vectorEffect="non-scaling-stroke"
                      />
                    );
                  })}
                </svg>
                {SIGNALS.map((signal) => (
                  <div
                    key={signal.id}
                    className="telescope-signal-node"
                    style={{ left: signal.left, top: signal.top }}
                  >
                    <span
                      className="telescope-signal-star"
                      style={
                        {
                          "--ts-star-opacity": stars.opacity,
                          "--ts-star-scale": stars.scale,
                          "--ts-star-brightness": stars.brightness,
                          "--ts-star-blur": `${stars.blur}px`,
                        } as CSSProperties
                      }
                    />
                    <span
                      className={`telescope-signal is-${signal.weight} is-${signal.anchor}`}
                      style={{ filter: signalFilter, opacity: signals.opacity }}
                    >
                      {signal.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="telescope-lens-vignette" />
          </div>

          <p className={`telescope-status ${acquired ? "is-acquired" : ""}`}>
            {acquired ? "FOCUS ACQUIRED" : "SEARCHING..."}
          </p>

          {showSlider && (
            <div className="telescope-focus-control">
              <label htmlFor="telescope-focus">FOCUS</label>
              <div className="telescope-focus-slider">
                <input
                  id="telescope-focus"
                  type="range"
                  min={0}
                  max={100}
                  value={focusValue}
                  onChange={(e) => onFocusChange(e.target.value)}
                  disabled={exiting}
                />
              </div>
              {acquired && (
                <button
                  type="button"
                  className="pixel-btn telescope-continue"
                  onClick={onContinue}
                  disabled={exiting}
                >
                  继续观测
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showDialogue && (
        <div className="telescope-dialogue">
          <DialogueBox lines={LINES} onFinish={afterDialogue} />
        </div>
      )}
    </div>
  );
}
