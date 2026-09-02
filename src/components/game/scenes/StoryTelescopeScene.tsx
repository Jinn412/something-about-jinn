import { useCallback, useRef, useState } from "react";
import { TelescopeEnding } from "../story-telescope/TelescopeEnding";
import { TelescopeFuture } from "../story-telescope/TelescopeFuture";
import { TelescopeLateNight } from "../story-telescope/TelescopeLateNight";
import { TelescopePerspectives } from "../story-telescope/TelescopePerspectives";
import { TelescopeSearch } from "../story-telescope/TelescopeSearch";
import { useGame } from "@/game/GameContext";
import type { SaveCheckpoint } from "@/game/saveGame";

type TelescopePhase =
  | "search"
  | "leaving"
  | "perspectives"
  | "leaving-t3"
  | "late-night"
  | "leaving-t4"
  | "future"
  | "ending";

type TelescopeResumeCheckpoint =
  | "telescope_search"
  | "telescope_perspectives"
  | "telescope_late_night"
  | "telescope_future"
  | "telescope_ending";

function isTelescopeResumeCheckpoint(cp: SaveCheckpoint | null): cp is TelescopeResumeCheckpoint {
  return (
    cp === "telescope_search" ||
    cp === "telescope_perspectives" ||
    cp === "telescope_late_night" ||
    cp === "telescope_future" ||
    cp === "telescope_ending"
  );
}

/** Map a Continue checkpoint to a stable outer phase. Leaving phases are never restored. */
function telescopeResumePhase(checkpoint: SaveCheckpoint | null): TelescopePhase {
  switch (checkpoint) {
    case "telescope_perspectives":
      return "perspectives";
    case "telescope_late_night":
      return "late-night";
    case "telescope_future":
      return "future";
    case "telescope_ending":
      return "ending";
    default:
      return "search";
  }
}

/** Telescope Story: T1 search → T3 perspectives → T4 late night → Future → visual ending. */
export function StoryTelescopeScene() {
  const {
    completeTelescopeStory,
    goToScene,
    telescopeStoryComplete,
    isDevStoryEntry,
    clearDevStoryEntry,
    pendingStoryResumeCheckpoint,
    markTelescopeSceneCheckpoint,
  } = useGame();
  const isReplay = useRef(telescopeStoryComplete).current;
  const enteredAsDev = useRef(isDevStoryEntry).current;
  const resumeAt = useRef(
    isTelescopeResumeCheckpoint(pendingStoryResumeCheckpoint)
      ? pendingStoryResumeCheckpoint
      : null,
  ).current;
  const persistTelescopeScene = useCallback(
    (checkpoint: Parameters<typeof markTelescopeSceneCheckpoint>[0]) => {
      if (isReplay || enteredAsDev) return;
      markTelescopeSceneCheckpoint(checkpoint);
    },
    [enteredAsDev, isReplay, markTelescopeSceneCheckpoint],
  );
  const persistTelescopeSceneRef = useRef(persistTelescopeScene);
  persistTelescopeSceneRef.current = persistTelescopeScene;

  const [phase, setPhase] = useState<TelescopePhase>(() => telescopeResumePhase(resumeAt));
  const [scopeGone, setScopeGone] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [visualEndingComplete, setVisualEndingComplete] = useState(false);
  const futureSettled = resumeAt === "telescope_ending";

  const finishStory = () => {
    if (!isReplay && !enteredAsDev) completeTelescopeStory();
    clearDevStoryEntry();
    goToScene("hub");
  };

  return (
    <div
      className={`telescope-story-root relative h-full w-full overflow-hidden ${phase === "ending" ? "is-telescope-ending" : ""} ${blackout ? "is-ending-blackout" : ""}`}
      data-visual-ending-complete={visualEndingComplete ? "true" : "false"}
    >
      {(phase === "leaving-t4" || phase === "future" || (phase === "ending" && !scopeGone)) && (
        <div className="absolute inset-0 z-[1]">
          <TelescopeFuture
            settled={futureSettled}
            {...(phase === "future"
              ? {
                  onStarfieldReady: () => {
                    persistTelescopeSceneRef.current("telescope_ending");
                    setPhase("ending");
                  },
                }
              : {})}
          />
        </div>
      )}
      {phase === "ending" && (
        <div className="absolute inset-0 z-[5]">
          <TelescopeEnding
            onBlackout={() => setBlackout(true)}
            onScopeGone={() => setScopeGone(true)}
            onVisualComplete={() => setVisualEndingComplete(true)}
            onLastLine={finishStory}
          />
        </div>
      )}
      {(phase === "leaving-t3" || phase === "late-night" || phase === "leaving-t4") && (
        <div
          className={`absolute inset-0 z-[2] ${phase === "leaving-t3" || phase === "leaving-t4" ? "pointer-events-none" : ""}`}
        >
          <TelescopeLateNight
            exiting={phase === "leaving-t4"}
            onContinue={phase === "late-night" ? () => setPhase("leaving-t4") : undefined}
            onExited={() => {
              persistTelescopeSceneRef.current("telescope_future");
              setPhase("future");
            }}
          />
        </div>
      )}
      {(phase === "leaving" || phase === "perspectives" || phase === "leaving-t3") && (
        <div
          className={`absolute inset-0 z-[3] ${phase === "leaving" || phase === "leaving-t3" ? "pointer-events-none" : ""}`}
        >
          <TelescopePerspectives
            exiting={phase === "leaving-t3"}
            onContinue={() => setPhase("leaving-t3")}
            onExited={() => {
              persistTelescopeSceneRef.current("telescope_late_night");
              setPhase("late-night");
            }}
          />
        </div>
      )}
      {(phase === "search" || phase === "leaving") && (
        <div className={`absolute inset-0 z-[4] ${phase === "leaving" ? "pointer-events-none" : ""}`}>
          <TelescopeSearch
            exiting={phase === "leaving"}
            onContinue={() => setPhase("leaving")}
            onExited={() => {
              persistTelescopeSceneRef.current("telescope_perspectives");
              setPhase("perspectives");
            }}
          />
        </div>
      )}
    </div>
  );
}
