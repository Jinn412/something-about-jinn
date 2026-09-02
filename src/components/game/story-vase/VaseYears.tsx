import { useEffect, useRef, useState } from "react";
import { useVaseMobileLandscape } from "./useVaseMobileLandscape";
import "./vase-mobile-landscape.css";

const NOTES = [
  { who: "客户", text: "这里再突出一点。", left: "8%", top: "26%" },
  { who: "设计", text: "这个区域放不下。", left: "60%", top: "22%" },
  { who: "技术", text: "这个实现需要调整。", left: "10%", top: "58%" },
  { who: "项目", text: "时间和预算要重新确认。", left: "57%", top: "56%" },
] as const;

const MARKS = [
  { left: "16%", top: "18%", width: "18%", height: "14%" },
  { left: "58%", top: "16%", width: "18%", height: "14%" },
  { left: "14%", top: "54%", width: "18%", height: "14%" },
  { left: "62%", top: "52%", width: "18%", height: "14%" },
] as const;

const NOTE_IN_MS = 220;
const NOTE_HOLD_MS = 1200;
const NOTE_OUT_MS = 220;
const PAUSE_AFTER_FEEDBACK_MS = 600;
const CLOCK_MOVE_MS = 450;
const CLOCK_HOLD_MS = 1200;
const CLOCK_RETURN_MS = 450;
const PAUSE_AFTER_CLOCK_MS = 500;
const PAUSE_BEFORE_REVISE_MS = 350;
const REV_A_MS = 650;
const REV_B_MS = 1300;
const REV_C_MS = 650;
const REV_HOLD_MS = 750;
const DESK_TRANS_MS = 550;
const DESK_SETTLE_MS = 300;

const ROUTE_OVERLAY_TRANSFORM = "translate(0.8%, -6%)";
const ROUTE_MASK_D =
  "M735 925 L735 828 L590 828 L590 516 L335 516 L335 290 L538 290 L538 412 L671 412 L671 294 L718 294 L718 449 L800 449 L800 782 L915 782 L915 696 L858 696 L858 580 L1004 580 L1004 290 L856 290 L856 161 L852 161 L852 153";

const SEG_LEFT = "M590 516 L335 516 L335 290 L538 290";
const SEG_MID = "M538 412 L671 412 L671 294 L718 294 L718 449 L800 449";
const SEG_RIGHT = "M858 580 L1004 580 L1004 290 L856 290";

type RevPhase = "a" | "b" | "c" | "hold" | null;

interface VaseYearsProps {
  onCoverDesk: () => void;
  onDeskReady: () => void;
  /** Skip the auto feedback/clock/revision sequence; clock already settled. */
  settled?: boolean;
}

/** Scene 3: serial beats through desk. Dialogue and second tender are click-driven in the parent. */
export function VaseYears({ onCoverDesk, onDeskReady, settled = false }: VaseYearsProps) {
  const [note, setNote] = useState(-1);
  const [noteOut, setNoteOut] = useState(false);
  const [clock, setClock] = useState(settled ? "01:16:38" : "72:00:00");
  const [clockFocus, setClockFocus] = useState(false);
  const [revPhase, setRevPhase] = useState<RevPhase>(null);
  const [black, setBlack] = useState(false);
  const coveredRef = useRef(false);
  const timers = useRef<number[]>([]);
  const mobileLandscape = useVaseMobileLandscape();

  useEffect(() => {
    if (settled) return;
    let cancelled = false;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
        timers.current.push(id);
      });

    const run = async () => {
      for (let i = 0; i < NOTES.length; i += 1) {
        if (cancelled) return;
        setNote(i);
        setNoteOut(false);
        await wait(NOTE_IN_MS + NOTE_HOLD_MS);
        if (cancelled) return;
        setNoteOut(true);
        await wait(NOTE_OUT_MS);
      }
      if (cancelled) return;
      setNote(-1);
      setNoteOut(false);

      await wait(PAUSE_AFTER_FEEDBACK_MS);
      if (cancelled) return;

      setClockFocus(true);
      await wait(CLOCK_MOVE_MS);
      if (cancelled) return;
      setClock("12:08:53");
      await wait(CLOCK_HOLD_MS);
      if (cancelled) return;
      setClockFocus(false);
      await wait(CLOCK_RETURN_MS);
      if (cancelled) return;
      await wait(PAUSE_BEFORE_REVISE_MS);
      if (cancelled) return;

      setRevPhase("a");
      await wait(REV_A_MS);
      if (cancelled) return;
      setRevPhase("b");
      await wait(REV_B_MS);
      if (cancelled) return;
      setRevPhase("c");
      await wait(REV_C_MS);
      if (cancelled) return;
      setRevPhase("hold");
      await wait(REV_HOLD_MS);
      if (cancelled) return;
      setRevPhase(null);

      setClockFocus(true);
      await wait(CLOCK_MOVE_MS);
      if (cancelled) return;
      setClock("01:16:38");
      await wait(CLOCK_HOLD_MS);
      if (cancelled) return;
      setClockFocus(false);
      await wait(CLOCK_RETURN_MS);
      if (cancelled) return;
      await wait(PAUSE_AFTER_CLOCK_MS);
      if (cancelled) return;

      setBlack(true);
      await wait(DESK_TRANS_MS);
      if (cancelled) return;
      if (!coveredRef.current) {
        coveredRef.current = true;
        onCoverDesk();
      }
      setBlack(false);
      await wait(DESK_SETTLE_MS);
      if (cancelled) return;
      onDeskReady();
    };

    void run();

    return () => {
      cancelled = true;
      timers.current.forEach((id) => window.clearTimeout(id));
    };
    // plays once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = note >= 0 ? NOTES[note] : null;
  const mark = note >= 0 ? MARKS[note] : null;
  const showRev = revPhase === "a" || revPhase === "b" || revPhase === "c";
  const showEdit = revPhase === "b" || revPhase === "c";
  const clockNode = (
    <div className={`vs-s3-clock ${clockFocus ? "is-focus" : ""}`}>{clock}</div>
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[20]">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
          {current && (
            <div
              className={`vs-s3-note ${noteOut ? "is-out" : ""}`}
              style={{ left: current.left, top: current.top }}
            >
              <div className="vs-s3-note-who">{current.who}</div>
              <div>{current.text}</div>
            </div>
          )}

          {mark && !noteOut && <div className="vs-s3-rev-box" style={mark} />}

          {showRev && (
            <RevisionBurst phase={revPhase} showEdit={showEdit} />
          )}

          {!mobileLandscape && clockNode}
        </div>
      </div>

      {mobileLandscape && <div className="vs-s3-clock-overlay">{clockNode}</div>}

      {black && <div className="vs-s3-black" />}
    </div>
  );
}

function RevisionBurst({
  phase,
  showEdit,
}: {
  phase: RevPhase;
  showEdit: boolean;
}) {
  return (
    <div className={`vs-s3-rev ${phase === "c" ? "is-resolve" : ""}`}>
      <div className="vs-s3-r-bracket vs-s3-r-a1 vs-s3-r-edit" />
      <div className="vs-s3-r-route-tick vs-s3-r-a2 vs-s3-r-edit" />
      <div className="vs-s3-r-bracket vs-s3-r-a3 vs-s3-r-edit" />

      {showEdit && (
        <>
          <div className="vs-s3-r-room vs-s3-r-room-old vs-s3-r-room-l vs-s3-r-edit" />
          <div className="vs-s3-r-room vs-s3-r-room-new vs-s3-r-room-l vs-s3-r-edit" />
          <div className="vs-s3-r-room vs-s3-r-room-old vs-s3-r-room-r vs-s3-r-edit" />
          <div className="vs-s3-r-room vs-s3-r-room-new vs-s3-r-room-r vs-s3-r-edit" />
          <div className="vs-s3-r-sign vs-s3-r-x vs-s3-r-x-l vs-s3-r-edit">×</div>
          <div className="vs-s3-r-sign vs-s3-r-ok vs-s3-r-ok-l vs-s3-r-edit">✓</div>
          <div className="vs-s3-r-sign vs-s3-r-x vs-s3-r-x-m vs-s3-r-edit">×</div>
          <div className="vs-s3-r-sign vs-s3-r-ok vs-s3-r-ok-m vs-s3-r-edit">✓</div>
          <div className="vs-s3-r-sign vs-s3-r-x vs-s3-r-x-r vs-s3-r-edit">×</div>
          <div className="vs-s3-r-sign vs-s3-r-ok vs-s3-r-ok-r vs-s3-r-edit">✓</div>
        </>
      )}

      <svg
        className="pointer-events-none absolute inset-0 z-[7] h-full w-full"
        viewBox="0 0 1536 1024"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: ROUTE_OVERLAY_TRANSFORM }}
        aria-hidden
      >
        <path
          className="vs-s3-r-seg vs-s3-r-a2-line vs-s3-r-edit"
          d={SEG_MID}
          fill="none"
          stroke="oklch(0.78 0.12 75)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showEdit && (
          <>
            <path
              className="vs-s3-r-seg vs-s3-r-mute vs-s3-r-mute-l vs-s3-r-edit"
              d={SEG_LEFT}
              fill="none"
              stroke="var(--parchment)"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="vs-s3-r-seg vs-s3-r-old vs-s3-r-old-l vs-s3-r-edit"
              d={SEG_LEFT}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(-14 10)"
            />
            <path
              className="vs-s3-r-seg vs-s3-r-gold vs-s3-r-gold-l vs-s3-r-edit"
              d={SEG_LEFT}
              fill="none"
              stroke="oklch(0.78 0.12 75)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
            <path
              className="vs-s3-r-seg vs-s3-r-mute vs-s3-r-mute-m vs-s3-r-edit"
              d={SEG_MID}
              fill="none"
              stroke="var(--parchment)"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="vs-s3-r-seg vs-s3-r-old vs-s3-r-old-m vs-s3-r-edit"
              d={SEG_MID}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(12 -12)"
            />
            <path
              className="vs-s3-r-seg vs-s3-r-gold vs-s3-r-gold-m vs-s3-r-edit"
              d={SEG_MID}
              fill="none"
              stroke="oklch(0.78 0.12 75)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
            <path
              className="vs-s3-r-seg vs-s3-r-mute vs-s3-r-mute-r vs-s3-r-edit"
              d={SEG_RIGHT}
              fill="none"
              stroke="var(--parchment)"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="vs-s3-r-seg vs-s3-r-old vs-s3-r-old-r vs-s3-r-edit"
              d={SEG_RIGHT}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(16 8)"
            />
            <path
              className="vs-s3-r-seg vs-s3-r-gold vs-s3-r-gold-r vs-s3-r-edit"
              d={SEG_RIGHT}
              fill="none"
              stroke="oklch(0.78 0.12 75)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
          </>
        )}
        {phase === "c" && (
          <path
            className="vs-s3-route-pulse"
            d={ROUTE_MASK_D}
            fill="none"
            stroke="oklch(0.82 0.1 75)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="miter"
          />
        )}
      </svg>
    </div>
  );
}
