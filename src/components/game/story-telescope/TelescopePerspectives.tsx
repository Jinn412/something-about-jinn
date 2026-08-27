import { useCallback, useEffect, useRef, useState } from "react";
import seminarArt from "@/assets/t3-seminar.png";
import { DialogueBox } from "../DialogueBox";
import { TelescopePanViewport, type PanTarget } from "./TelescopePanViewport";
import "./telescope-story.css";
import "./telescope-t3-mobile.css";

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
const AFTER_STUDENTS_MS = 300;
const NOTE_HOLD_MS = 500;
const AFTER_PROF_MS = 500;
const LEAVE_MS = 550;

const STUDENTS: PanTarget = { id: "students", x: 33, y: 61 };
const PROFESSOR: PanTarget = { id: "professor", x: 80, y: 52 };

const STUDENT_LINES = [
  { speaker: "", text: "同一个问题，在NTU经常可以发现不同的答案。" },
  { speaker: "", text: "她开始习惯先听，再判断。" },
];

const PROF_LINE = [
  {
    speaker: "Prof：",
    text: "别急着决定自己要成为什么，先弄清楚你真正想解决什么问题。",
  },
];

const CLOSE_LINE = [
  {
    speaker: "",
    text: "她没有立刻得到答案，但开始更认真地追问：我到底想做什么样的东西？",
  },
];

type Phase =
  | "search-students"
  | "lock-students"
  | "obs1"
  | "restore-students"
  | "search-professor"
  | "lock-professor"
  | "note"
  | "prof-line"
  | "restore-professor"
  | "close-line"
  | "complete";

/** Telescope Story T3: PEOPLE & PERSPECTIVES. Two observations, then free browse. */
export function TelescopePerspectives({
  exiting = false,
  onContinue,
  onExited,
}: {
  exiting?: boolean;
  onContinue?: () => void;
  onExited?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("search-students");
  const [status, setStatus] = useState("SEARCHING...");
  const [viewScale, setViewScale] = useState(EXPLORATION_SCALE);
  const [focusTarget, setFocusTarget] = useState<PanTarget | null>(null);
  const [reticleHot, setReticleHot] = useState(false);
  const [hintKey, setHintKey] = useState(0);
  const [near, setNear] = useState(false);
  const timers = useRef<number[]>([]);
  const completed = useRef(new Set<string>());
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const id = window.setTimeout(() => onExitedRef.current?.(), LEAVE_MS);
    return () => window.clearTimeout(id);
  }, [exiting]);

  const later = useCallback((ms: number, fn: () => void) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const searching = phase === "search-students" || phase === "search-professor";
  const focusing = phase === "lock-students" || phase === "lock-professor";
  const restoring = phase === "restore-students" || phase === "restore-professor";
  const panEnabled = (searching || phase === "complete") && !exiting;
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
  }, []);

  const restoreExploration = useCallback(() => {
    setFocusTarget(null);
    setViewScale(EXPLORATION_SCALE);
  }, []);

  const onAcquire = useCallback(
    (id: string) => {
      if (completed.current.has(id)) return;
      const now = phaseRef.current;
      if (id === "students" && now === "search-students") {
        completed.current.add("students");
        setPhase("lock-students");
        beginFocus(STUDENTS);
        later(FOCUS_MS, () => {
          setReticleHot(false);
          later(AFTER_FOCUS_HOLD_MS, () => {
            setStatus("OBSERVATION 01");
            later(AFTER_OBS_MS, () => setPhase("obs1"));
          });
        });
      }
      if (id === "professor" && now === "search-professor") {
        completed.current.add("professor");
        setPhase("lock-professor");
        beginFocus(PROFESSOR);
        later(FOCUS_MS, () => {
          setReticleHot(false);
          later(AFTER_FOCUS_HOLD_MS, () => {
            setStatus("OBSERVATION 02");
            later(280, () => {
              setPhase("note");
              later(NOTE_HOLD_MS, () => setPhase("prof-line"));
            });
          });
        });
      }
    },
    [beginFocus, later],
  );

  const afterStudents = () => {
    setPhase("restore-students");
    restoreExploration();
    later(RESTORE_MS, () => {
      later(AFTER_STUDENTS_MS, () => {
        setStatus("SEARCHING...");
        setPhase("search-professor");
      });
    });
  };

  const afterProfessor = () => {
    setPhase("restore-professor");
    restoreExploration();
    later(RESTORE_MS, () => {
      later(AFTER_PROF_MS, () => setPhase("close-line"));
    });
  };

  const afterClose = () => {
    setPhase("complete");
  };

  const searchTarget =
    phase === "search-students" ? STUDENTS : phase === "search-professor" ? PROFESSOR : null;
  const motionMs = restoring ? RESTORE_MS : FOCUS_MS;

  const showNote = phase === "note";
  const showStudentDialogue = phase === "obs1";
  const showProfDialogue = phase === "prof-line";
  const showCloseDialogue = phase === "close-line";

  return (
    <div className={`telescope-perspectives ${exiting ? "is-leaving" : ""}`}>
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="telescope-stage relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
          <img
            src={seminarArt}
            alt=""
            width={1536}
            height={1024}
            draggable={false}
            className="telescope-t3-outer"
          />
          <div className="telescope-sky-vignette" />

          <p className="telescope-label">TELESCOPE / 03</p>

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

          <div
            className={`telescope-lens-overlay ${reticleHot ? "is-hot" : ""} ${near ? "is-near" : ""}`}
          >
            <TelescopePanViewport
              src={seminarArt}
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
            />
            <div className="telescope-lens-vignette" />
          </div>

          {phase !== "complete" && (
            <p className={`telescope-status ${status !== "SEARCHING..." ? "is-held" : ""}`}>
              {status}
            </p>
          )}
          {showNote && <p className="telescope-t3-note">A NOTE SHE KEPT</p>}
          {phase === "complete" && onContinue && !exiting && (
            <div className="telescope-next-continue">
              <button type="button" className="pixel-btn telescope-continue" onClick={onContinue}>
                继续观测
              </button>
            </div>
          )}
        </div>
      </div>

      {showStudentDialogue && (
        <div className="telescope-dialogue">
          <DialogueBox lines={STUDENT_LINES} onFinish={afterStudents} />
        </div>
      )}
      {showProfDialogue && (
        <div className="telescope-dialogue">
          <DialogueBox lines={PROF_LINE} onFinish={afterProfessor} />
        </div>
      )}
      {showCloseDialogue && (
        <div className="telescope-dialogue">
          <DialogueBox lines={CLOSE_LINE} onFinish={afterClose} />
        </div>
      )}
    </div>
  );
}
