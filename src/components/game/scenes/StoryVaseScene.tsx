import { useEffect, useRef, useState } from "react";
import vaseDesk from "@/assets/vasedesk.png";
import tenderArt from "@/assets/tender.png";
import tenderOpenArt from "@/assets/tenderopen.png";
import project37Art from "@/assets/project37.png";
import projectFinanceArt from "@/assets/projectFinance.png";
import projectAnleyuanArt from "@/assets/projectAnleyuan.png";
import { DialogueBox } from "../DialogueBox";
import { VaseTheLine } from "../story-vase/VaseTheLine";
import { VaseYears } from "../story-vase/VaseYears";
import { VaseAbilityPanel } from "../story-vase/VaseAbilityPanel";
import { useGame } from "@/game/GameContext";
import "../story-vase/vase-story.css";

const DESK_HOLD_MS = 700;
const DROP_MS = 720;
const IMPACT_AT_MS = 530;
const IMPACT_MS = 100;
const DEADLINE_AFTER_SETTLE_MS = 200;
const DIALOGUE_AFTER_DEADLINE_MS = 300;

const LIFT_MS = 600;
const DIALOGUE_FADE_MS = 180;
const CROSSFADE_DELAY_MS = 200;
const CHOICE_AFTER_OPEN_MS = 280;
const HINT_MS = 800;
const HIGHLIGHT_STEP_MS = 180;
const HIGHLIGHT_TOTAL_MS = 640;

const OPENING_LINE = [{ speaker: "", text: "七十二小时后，述标。" }];
const RESOLVE_LINE = [{ speaker: "", text: "先找到真正的问题。" }];
const DESK_LINES = [
  { speaker: "", text: "项目提交完成。" },
  { speaker: "", text: "呼，是不是可以休息一下了？" },
];
const PUNCH_LINE = [{ speaker: "", text: "…………" }];
const YEARS_LINES = [
  { speaker: "", text: "问题没有变少。" },
  { speaker: "", text: "只是她越来越知道，该从哪里开始。" },
];
const CLOSE_LINE_1 = [{ speaker: "", text: "两年以后，她带走的，不只是做过的项目。" }];
const CLOSE_LINE_2 = [{ speaker: "", text: "还有一套属于自己的，解决问题的方法。" }];
const CLOSE_DESK_MS = 500;
const CLOSE_FADE_MS = 300;
const CLOSE_HOLD_MS = 300;
const END_BLACK_MS = 600;

const S3_DROP_MS = 760;
const S3_IMPACT_AT_MS = 562;
const S3_QUIET_MS = 1000;
const S3_PUNCH_PAUSE_MS = 550;
const S3_AFTER_PUNCH_MS = 300;
const S3_EXTRA_GAP_MS = 500;
const S3_EXTRA_IN_MS = 800;
const S3_AFTER_FILES_MS = 700;
const S3_BLACK_IN_MS = 600;
const S3_BLACK_HOLD_MS = 600;
const S3_YEARS_IN_MS = 350;
const S3_YEARS_HOLD_MS = 900;
const S3_BLACK_OUT_MS = 650;
const S3_AFTER_DESK_MS = 350;

const EXTRA_FILES = [
  {
    src: project37Art,
    iw: 1312,
    ih: 1199,
    left: "6%",
    bottom: "27.5%",
    width: "18%",
    rotate: "0deg",
    z: 4,
  },
  {
    src: projectFinanceArt,
    iw: 1536,
    ih: 1024,
    left: "39.4%",
    bottom: "14.4%",
    width: "22.2%",
    rotate: "0deg",
    z: 6,
  },
  {
    src: projectAnleyuanArt,
    iw: 1536,
    ih: 1024,
    left: "59%",
    bottom: "30%",
    width: "19.9%",
    rotate: "0deg",
    z: 6,
  },
] as const;

const HIGHLIGHTS = [
  { left: "10%", top: "13%", width: "33%", height: "21%" },
  { left: "52%", top: "13%", width: "35%", height: "23%" },
  { left: "10%", top: "52%", width: "33%", height: "24%" },
] as const;

type HintId = "plan" | "space";

/** Vase Story Scene 1: desk drop → open tender → three choices. Stops before Scene 2. */
export function StoryVaseScene() {
  const { completeVaseStory, goToScene, vaseStoryComplete, isDevStoryEntry, clearDevStoryEntry } =
    useGame();
  const isReplay = useRef(vaseStoryComplete).current;
  const enteredAsDev = useRef(isDevStoryEntry).current;
  const [showTender, setShowTender] = useState(false);
  const [tenderLanded, setTenderLanded] = useState(false);
  const [impact, setImpact] = useState(false);
  const [showDeadline, setShowDeadline] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [lineFading, setLineFading] = useState(false);
  const [lifting, setLifting] = useState(false);
  const [opened, setOpened] = useState(false);
  const [crossfade, setCrossfade] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [choicesOut, setChoicesOut] = useState(false);
  const [hint, setHint] = useState<HintId | null>(null);
  const [highlightCount, setHighlightCount] = useState(0);
  const [showResolve, setShowResolve] = useState(false);
  const [resolveFading, setResolveFading] = useState(false);
  const [receding, setReceding] = useState(false);
  const [scene2, setScene2] = useState(false);
  const [scene3, setScene3] = useState(false);
  const [scene3Line, setScene3Line] = useState<
    "desk" | "punch" | "years" | "close1" | "close2" | null
  >(null);
  const [scene3LineOut, setScene3LineOut] = useState(false);
  const [s3Drop, setS3Drop] = useState(false);
  const [punchOut, setPunchOut] = useState(false);
  const [extraCount, setExtraCount] = useState(0);
  const [showCut, setShowCut] = useState(false);
  const [cutOut, setCutOut] = useState(false);
  const [showYears, setShowYears] = useState(false);
  const [yearsRest, setYearsRest] = useState(false);
  const [showAbility, setShowAbility] = useState(false);
  const [endBlack, setEndBlack] = useState(false);
  const [deskZoom, setDeskZoom] = useState(false);
  const [floorTaken, setFloorTaken] = useState(false);
  const pickedRef = useRef(false);
  const s3RestDone = useRef(false);
  const s3PunchDone = useRef(false);
  const s3YearsDone = useRef(false);
  const closeStarted = useRef(false);
  const close1Done = useRef(false);
  const close2Done = useRef(false);
  const timersRef = useRef<number[]>([]);

  const queue = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  useEffect(() => {
    const dropAt = DESK_HOLD_MS;
    const settledAt = dropAt + DROP_MS;
    const deadlineAt = settledAt + DEADLINE_AFTER_SETTLE_MS;
    const ids = [
      window.setTimeout(() => setShowTender(true), dropAt),
      window.setTimeout(() => setImpact(true), dropAt + IMPACT_AT_MS),
      window.setTimeout(() => setImpact(false), dropAt + IMPACT_AT_MS + IMPACT_MS),
      window.setTimeout(() => setTenderLanded(true), settledAt),
      window.setTimeout(() => setShowDeadline(true), deadlineAt),
      window.setTimeout(() => setShowLine(true), deadlineAt + DIALOGUE_AFTER_DEADLINE_MS),
    ];
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const startOpen = () => {
    if (lifting || opened) return;
    setLineFading(true);
    setLifting(true);
    queue(() => setShowLine(false), DIALOGUE_FADE_MS);
    queue(() => setCrossfade(true), CROSSFADE_DELAY_MS);
    queue(() => {
      setOpened(true);
      setLifting(false);
    }, LIFT_MS);
    queue(() => setShowChoices(true), LIFT_MS + CHOICE_AFTER_OPEN_MS);
  };

  const showHint = (id: HintId) => {
    if (pickedRef.current) return;
    setHint(id);
    queue(() => setHint((current) => (current === id ? null : current)), HINT_MS);
  };

  const pickDemand = () => {
    if (pickedRef.current) return;
    pickedRef.current = true;
    setHint(null);
    setChoicesOut(true);
    queue(() => setShowChoices(false), 180);
    queue(() => setHighlightCount(1), 180);
    queue(() => setHighlightCount(2), 180 + HIGHLIGHT_STEP_MS);
    queue(() => setHighlightCount(3), 180 + HIGHLIGHT_STEP_MS * 2);
    queue(() => {
      setHighlightCount(0);
      setShowResolve(true);
    }, 180 + HIGHLIGHT_TOTAL_MS);
  };

  const startScene2 = () => {
    if (receding || scene2) return;
    setResolveFading(true);
    setReceding(true);
    queue(() => setShowResolve(false), DIALOGUE_FADE_MS);
    queue(() => {
      setShowTender(false);
      setScene2(true);
    }, 420);
  };

  const afterRestClick = () => {
    if (s3RestDone.current) return;
    s3RestDone.current = true;
    setScene3LineOut(true);
    queue(() => {
      setScene3Line(null);
      setScene3LineOut(false);
    }, DIALOGUE_FADE_MS);
    queue(() => {
      setReceding(false);
      setOpened(false);
      setLifting(false);
      setCrossfade(false);
      setTenderLanded(false);
      setS3Drop(true);
      setShowTender(true);
      queue(() => setImpact(true), S3_IMPACT_AT_MS);
      queue(() => setImpact(false), S3_IMPACT_AT_MS + IMPACT_MS);
      queue(() => setTenderLanded(true), S3_DROP_MS);
    }, DIALOGUE_FADE_MS + S3_QUIET_MS);
    queue(
      () => setScene3Line("punch"),
      DIALOGUE_FADE_MS + S3_QUIET_MS + S3_DROP_MS + S3_PUNCH_PAUSE_MS,
    );
  };

  const afterPunchClick = () => {
    if (s3PunchDone.current) return;
    s3PunchDone.current = true;
    setPunchOut(true);
    queue(() => {
      setScene3Line(null);
      setPunchOut(false);
    }, DIALOGUE_FADE_MS);
    queue(() => setExtraCount(1), DIALOGUE_FADE_MS + S3_AFTER_PUNCH_MS);
    queue(() => setExtraCount(2), DIALOGUE_FADE_MS + S3_AFTER_PUNCH_MS + S3_EXTRA_GAP_MS);
    queue(
      () => setExtraCount(3),
      DIALOGUE_FADE_MS + S3_AFTER_PUNCH_MS + S3_EXTRA_GAP_MS * 2,
    );
    const filesSettled =
      DIALOGUE_FADE_MS + S3_AFTER_PUNCH_MS + S3_EXTRA_GAP_MS * 2 + S3_EXTRA_IN_MS;
    const blackAt = filesSettled + S3_AFTER_FILES_MS;
    queue(() => setShowCut(true), blackAt);
    queue(() => setShowYears(true), blackAt + S3_BLACK_IN_MS + S3_BLACK_HOLD_MS);
    queue(() => {
      setYearsRest(true);
      setCutOut(true);
    }, blackAt + S3_BLACK_IN_MS + S3_BLACK_HOLD_MS + S3_YEARS_IN_MS + S3_YEARS_HOLD_MS);
    queue(
      () => setShowCut(false),
      blackAt +
        S3_BLACK_IN_MS +
        S3_BLACK_HOLD_MS +
        S3_YEARS_IN_MS +
        S3_YEARS_HOLD_MS +
        S3_BLACK_OUT_MS,
    );
    queue(
      () => setScene3Line("years"),
      blackAt +
        S3_BLACK_IN_MS +
        S3_BLACK_HOLD_MS +
        S3_YEARS_IN_MS +
        S3_YEARS_HOLD_MS +
        S3_BLACK_OUT_MS +
        S3_AFTER_DESK_MS,
    );
  };

  const afterYearsClick = () => {
    if (s3YearsDone.current) return;
    s3YearsDone.current = true;
    setScene3LineOut(true);
    queue(() => {
      setScene3Line(null);
      setScene3LineOut(false);
    }, DIALOGUE_FADE_MS);
    queue(() => setShowAbility(true), DIALOGUE_FADE_MS + 300);
  };

  const afterAbilityDismiss = () => {
    if (closeStarted.current) return;
    closeStarted.current = true;
    setShowAbility(false);
    setScene3(false);
    setShowDeadline(false);
    queue(() => setScene3Line("close1"), CLOSE_DESK_MS);
  };

  const afterClose1 = () => {
    if (close1Done.current) return;
    close1Done.current = true;
    setScene3Line("close2");
  };

  const finishStory = () => {
    if (!isReplay && !enteredAsDev) completeVaseStory();
    clearDevStoryEntry();
    goToScene("hub");
  };

  const afterClose2 = () => {
    if (close2Done.current) return;
    close2Done.current = true;
    setScene3LineOut(true);
    queue(() => {
      setScene3Line(null);
      setScene3LineOut(false);
    }, CLOSE_FADE_MS);
    queue(() => setEndBlack(true), CLOSE_FADE_MS + CLOSE_HOLD_MS);
    queue(finishStory, CLOSE_FADE_MS + CLOSE_HOLD_MS + END_BLACK_MS);
  };

  const docClass = [
    "vs-doc",
    !tenderLanded
      ? ""
      : receding
        ? "is-open is-recede"
        : lifting
          ? "is-lift"
          : opened
            ? "is-open"
            : "is-desk-settled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="vs-scene relative h-full w-full overflow-hidden bg-[oklch(0.12_0.03_270)]">
      <div className={`absolute inset-0 ${impact ? "vs-desk-impact" : ""}`}>
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
            <img
              src={vaseDesk}
              alt=""
              width={1536}
              height={1024}
              className={`absolute inset-0 h-full w-full object-cover object-center ${
                deskZoom && !floorTaken ? "vs-s2-zoom" : ""
              }`}
              style={floorTaken ? { opacity: 0 } : undefined}
            />

            <div
              className={`vs-desk-dim absolute inset-0 ${
                lifting || (opened && !receding) ? "is-on" : ""
              }`}
            />

            {showTender && (
              <div className={docClass}>
                <img
                  src={tenderArt}
                  alt=""
                  width={1536}
                  height={1024}
                  className={`vs-doc-closed pointer-events-none bg-transparent ${
                    !tenderLanded ? (s3Drop ? "vs-tender-drop-s3" : "vs-tender-drop") : ""
                  } ${crossfade ? "is-out" : ""}`}
                />
                {(crossfade || opened) && (
                  <img
                    src={tenderOpenArt}
                    alt=""
                    width={1536}
                    height={1024}
                    className="vs-doc-open pointer-events-none bg-transparent"
                  />
                )}
                {HIGHLIGHTS.map((box, i) =>
                  i < highlightCount ? (
                    <div
                      key={i}
                      className="vs-highlight pointer-events-none absolute"
                      style={box}
                    />
                  ) : null,
                )}
              </div>
            )}

            {EXTRA_FILES.map((file, i) =>
              i < extraCount ? (
                <div
                  key={i}
                  className="vs-s3-extra pointer-events-none"
                  style={{
                    left: file.left,
                    bottom: file.bottom,
                    width: file.width,
                    zIndex: file.z,
                  }}
                >
                  <img
                    src={file.src}
                    alt=""
                    width={file.iw}
                    height={file.ih}
                    className="pointer-events-none bg-transparent"
                  />
                </div>
              ) : null,
            )}

            {showDeadline && !scene3 && (
              <div
                className={`vs-deadline-in pointer-events-none absolute right-[4.2%] top-[10.5%] z-20 border-4 border-wood-dark bg-parchment px-3 py-1 text-xs tracking-[0.12em] text-ink shadow-[inset_0_0_0_3px_var(--parchment-dark),0_0_0_3px_oklch(0_0_0/40%)] md:text-sm ${
                  floorTaken ? "vs-deadline-quiet" : ""
                }`}
              >
                72:00:00
              </div>
            )}

            {showChoices && (
              <div
                className={`vs-choice-row absolute left-1/2 z-20 flex -translate-x-1/2 gap-2 ${
                  choicesOut ? "is-out" : ""
                }`}
              >
                <span className="relative">
                  <button
                    type="button"
                    className="pixel-btn px-3 py-2 text-xs"
                    onClick={() => showHint("plan")}
                  >
                    写方案
                  </button>
                  {hint === "plan" && <span className="vs-float-hint">还太早。</span>}
                </span>
                <span className="relative">
                  <button
                    type="button"
                    className="pixel-btn px-3 py-2 text-xs"
                    onClick={() => showHint("space")}
                  >
                    画空间
                  </button>
                  {hint === "space" && <span className="vs-float-hint">问题还没弄清。</span>}
                </span>
                <button
                  type="button"
                  className="pixel-btn px-3 py-2 text-xs"
                  onClick={pickDemand}
                >
                  拆需求
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {scene2 && (
        <VaseTheLine
          onZoom={() => setDeskZoom(true)}
          onFloor={() => setFloorTaken(true)}
          onFinish={() => setScene3(true)}
        />
      )}

      {scene3 && (
        <VaseYears
          onCoverDesk={() => {
            setScene2(false);
            setFloorTaken(false);
            setDeskZoom(false);
          }}
          onDeskReady={() => setScene3Line("desk")}
        />
      )}

      {showCut && <div className={`vs-s3-cut ${cutOut ? "is-out" : ""}`} />}

      {showYears && (
        <div className={`vs-s3-years ${yearsRest ? "is-rest" : ""}`}>2+ YEARS</div>
      )}

      {showLine && (
        <div className={`vs-dialogue ${lineFading ? "is-out" : ""}`}>
          <DialogueBox lines={OPENING_LINE} onFinish={startOpen} />
        </div>
      )}

      {showResolve && (
        <div className={`vs-dialogue ${resolveFading ? "is-out" : ""}`}>
          <DialogueBox lines={RESOLVE_LINE} onFinish={startScene2} />
        </div>
      )}

      {scene3Line === "desk" && (
        <div className={`vs-dialogue ${scene3LineOut ? "pointer-events-none is-out" : ""}`}>
          <DialogueBox lines={DESK_LINES} onFinish={afterRestClick} />
        </div>
      )}

      {scene3Line === "punch" && (
        <div className={`vs-dialogue ${punchOut ? "pointer-events-none is-out" : ""}`}>
          <DialogueBox lines={PUNCH_LINE} onFinish={afterPunchClick} />
        </div>
      )}

      {scene3Line === "years" && (
        <div className={`vs-dialogue ${scene3LineOut ? "pointer-events-none is-out" : ""}`}>
          <DialogueBox lines={YEARS_LINES} onFinish={afterYearsClick} />
        </div>
      )}

      {scene3Line === "close1" && (
        <div className="vs-dialogue">
          <DialogueBox lines={CLOSE_LINE_1} onFinish={afterClose1} />
        </div>
      )}

      {scene3Line === "close2" && (
        <div className={`vs-dialogue ${scene3LineOut ? "pointer-events-none is-end-out" : ""}`}>
          <DialogueBox lines={CLOSE_LINE_2} onFinish={afterClose2} />
        </div>
      )}

      {showAbility && <VaseAbilityPanel onDismiss={afterAbilityDismiss} />}

      {endBlack && <div className="vs-end-black" />}
    </div>
  );
}
