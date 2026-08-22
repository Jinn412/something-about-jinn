import { useEffect, useRef, useState } from "react";
import floorplanArt from "@/assets/floorplan.png";
import routeMasterArt from "@/assets/vase_route_master.png";
import { DialogueBox } from "../DialogueBox";

const CARDS = [
  "为什么要建？",
  "谁来看？",
  "想让他们知道什么？",
  "有什么限制？",
] as const;

const DESK_POS = [
  { left: "22%", top: "29%" },
  { left: "54%", top: "29%" },
  { left: "22%", top: "50%" },
  { left: "54%", top: "50%" },
] as const;

const FLOOR_POS = [
  { left: "16%", top: "16%" },
  { left: "62%", top: "15%" },
  { left: "15%", top: "58%" },
  { left: "66%", top: "56%" },
] as const;

const MONITOR = { left: "50%", top: "35%" };

const CARD_POP_STAGGER_MS = 160;
const CARD_HOLD_MS = 1200;
const CARD_FLY_MS = 820;
const CARD_FLY_STAGGER_MS = 50;
const ZOOM_AFTER_FLY_MS = 360;
const ZOOM_MS = 800;
const FLASH_MS = 140;
const FLOOR_FADE_MS = 220;
const UNFOLD_MS = 300;
const UNFOLD_STAGGER_MS = 280;
const AFTER_UNFOLD_MS = 400;
const ASK_OUT_MS = 180;
const ROUTE_WAIT_MS = 250;
const ROUTE_REVEAL_MS = 3600;
const AFTER_ROUTE_MS = 500;
const WALK_MS = 1350;
const END_HOLD_MS = 600;

const ASK_LINE = [{ speaker: "", text: "信息，不等于故事。" }];
const LINE_LINE = [{ speaker: "", text: "她要找到那条，把它们串起来的线。" }];

const ROUTE_OVERLAY_TRANSFORM = "translate(0.8%, -6%)";

/** Invisible mask path in the 1536×1024 PNG canvas. Not rendered as a visible route. */
const ROUTE_MASK_D =
  "M735 925 L735 828 L590 828 L590 516 L335 516 L335 290 L538 290 L538 412 L671 412 L671 294 L718 294 L718 449 L800 449 L800 782 L915 782 L915 696 L858 696 L858 580 L1004 580 L1004 290 L856 290 L856 161 L852 161 L852 153";

const ROUTE_MASK_STROKE = 28;
const CARD_HIT_MS = 480;

/** Route visit order, not card array order. Progress is along the 3.6s reveal. */
const CARD_HITS = [
  { card: 2, at: 0.22 },
  { card: 0, at: 0.34 },
  { card: 3, at: 0.8 },
  { card: 1, at: 0.92 },
] as const;

type Phase =
  | "show"
  | "fly"
  | "zoom"
  | "flash"
  | "floor"
  | "ask"
  | "seed"
  | "route"
  | "dim"
  | "told"
  | "walk"
  | "end";

interface VaseTheLineProps {
  onZoom: () => void;
  onFloor: () => void;
  onFinish?: () => void;
}

/** Scene 2: four questions on the desk, into the monitor, then a route on the floorplan. */
export function VaseTheLine({ onZoom, onFloor, onFinish }: VaseTheLineProps) {
  const [phase, setPhase] = useState<Phase>("show");
  const [zoom, setZoom] = useState(false);
  const [unfolded, setUnfolded] = useState(0);
  const [ping, setPing] = useState<number | null>(null);
  const [askOut, setAskOut] = useState(false);
  const [toldOut, setToldOut] = useState(false);
  const startedRef = useRef(false);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  };

  useEffect(() => {
    const flyAt = CARD_POP_STAGGER_MS * 3 + 140 + CARD_HOLD_MS;
    const zoomAt = flyAt + ZOOM_AFTER_FLY_MS;
    const flashAt = zoomAt + ZOOM_MS;
    const floorAt = flashAt + FLASH_MS;
    const unfoldAt = floorAt + FLOOR_FADE_MS;
    const askAt = unfoldAt + UNFOLD_STAGGER_MS * 3 + UNFOLD_MS + AFTER_UNFOLD_MS;

    later(() => setPhase("fly"), flyAt);
    later(() => {
      setPhase("zoom");
      setZoom(true);
      onZoom();
    }, zoomAt);
    later(() => setPhase("flash"), flashAt);
    later(() => {
      setPhase("floor");
      onFloor();
    }, floorAt);
    later(() => setUnfolded(1), unfoldAt);
    later(() => setUnfolded(2), unfoldAt + UNFOLD_STAGGER_MS);
    later(() => setUnfolded(3), unfoldAt + UNFOLD_STAGGER_MS * 2);
    later(() => setUnfolded(4), unfoldAt + UNFOLD_STAGGER_MS * 3);
    later(() => setPhase("ask"), askAt);

    return () => timers.current.forEach((id) => window.clearTimeout(id));
    // plays once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishAsk = () => {
    if (phase !== "ask" || startedRef.current) return;
    startedRef.current = true;
    setAskOut(true);
    later(() => setPhase("seed"), ASK_OUT_MS);
    later(() => setPhase("route"), ASK_OUT_MS + ROUTE_WAIT_MS);
    const routeAt = ASK_OUT_MS + ROUTE_WAIT_MS;
    CARD_HITS.forEach(({ card, at }) => {
      later(() => setPing(card), routeAt + at * ROUTE_REVEAL_MS);
      later(
        () => setPing((current) => (current === card ? null : current)),
        routeAt + at * ROUTE_REVEAL_MS + CARD_HIT_MS,
      );
    });
    later(() => setPhase("dim"), routeAt + ROUTE_REVEAL_MS);
    later(
      () => setPhase("told"),
      ASK_OUT_MS + ROUTE_WAIT_MS + ROUTE_REVEAL_MS + AFTER_ROUTE_MS,
    );
  };

  const finishTold = () => {
    if (phase !== "told") return;
    setToldOut(true);
    later(() => setPhase("walk"), 180);
    later(() => {
      setPhase("end");
      onFinish?.();
    }, 180 + 300);
  };

  const onDesk = phase === "show" || phase === "fly" || phase === "zoom";
  const showFloor =
    phase === "floor" ||
    phase === "ask" ||
    phase === "seed" ||
    phase === "route" ||
    phase === "dim" ||
    phase === "told" ||
    phase === "walk" ||
    phase === "end";

  return (
    <div className="pointer-events-none absolute inset-0 z-[8]">
      {onDesk && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div
            className={`relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full ${
              zoom ? "vs-s2-zoom" : ""
            }`}
          >
            {CARDS.map((text, i) => (
              <div
                key={text}
                className={`vs-s2-card ${phase === "fly" || phase === "zoom" ? "is-fly" : "is-pop"}`}
                style={{
                  ...DESK_POS[i],
                  ["--ex" as string]: MONITOR.left,
                  ["--ey" as string]: MONITOR.top,
                  animationDelay:
                    phase === "fly" || phase === "zoom"
                      ? `${i * CARD_FLY_STAGGER_MS}ms`
                      : `${i * CARD_POP_STAGGER_MS}ms`,
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === "flash" && <div className="vs-s2-flash" />}

      {showFloor && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
            <img
              src={floorplanArt}
              alt=""
              width={1536}
              height={1024}
              className="vs-s2-floor absolute inset-0 h-full w-full object-cover object-center"
            />
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 1536 1024"
              preserveAspectRatio="xMidYMid slice"
              style={{ transform: ROUTE_OVERLAY_TRANSFORM }}
              aria-hidden
            >
              <defs>
                <mask
                  id="vase-route-reveal-mask"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="1536"
                  height="1024"
                >
                  <path
                    className={routeMaskClass(phase)}
                    d={ROUTE_MASK_D}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={ROUTE_MASK_STROKE}
                    strokeLinecap="round"
                    strokeLinejoin="miter"
                    pathLength={1}
                  >
                    {phase === "route" && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="1"
                        to="0"
                        dur="3.6s"
                        fill="freeze"
                        calcMode="linear"
                      />
                    )}
                  </path>
                </mask>
              </defs>
              <image
                href={routeMasterArt}
                width="1536"
                height="1024"
                preserveAspectRatio="xMidYMid slice"
                mask="url(#vase-route-reveal-mask)"
              />
            </svg>

            {CARDS.map((text, i) => {
              const ready = i < unfolded;
              return ready ? (
                <div
                  key={text}
                  className={`vs-s2-floor-card ${floorCardClass(i, unfolded, ping, phase)}`}
                  style={FLOOR_POS[i]}
                >
                  {text}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {phase === "ask" && (
        <div className={`vs-dialogue pointer-events-auto ${askOut ? "is-out" : ""}`}>
          <DialogueBox lines={ASK_LINE} onFinish={finishAsk} />
        </div>
      )}

      {phase === "told" && (
        <div className={`vs-dialogue pointer-events-auto ${toldOut ? "is-out" : ""}`}>
          <DialogueBox lines={LINE_LINE} onFinish={finishTold} />
        </div>
      )}
    </div>
  );
}

function routeMaskClass(phase: Phase) {
  if (phase === "route") return "vs-s2-route-mask is-draw";
  if (
    phase === "dim" ||
    phase === "told" ||
    phase === "walk" ||
    phase === "end"
  ) {
    return "vs-s2-route-mask is-shown";
  }
  return "vs-s2-route-mask";
}

function floorCardClass(
  index: number,
  unfolded: number,
  ping: number | null,
  phase: Phase,
) {
  const justOpen = unfolded === index + 1;
  return [
    justOpen ? "is-open" : "is-ready",
    ping === index ? "is-ping" : "",
    phase === "told" || phase === "walk" ? "is-soft" : "",
    phase === "end" ? "is-softest" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
