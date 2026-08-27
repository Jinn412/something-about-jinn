import { useRef, useState } from "react";
import { TelescopeEnding } from "../story-telescope/TelescopeEnding";
import { TelescopeFuture } from "../story-telescope/TelescopeFuture";
import { TelescopeLateNight } from "../story-telescope/TelescopeLateNight";
import { TelescopePerspectives } from "../story-telescope/TelescopePerspectives";
import { TelescopeSearch } from "../story-telescope/TelescopeSearch";
import { useGame } from "@/game/GameContext";

type TelescopePhase =
  | "search"
  | "leaving"
  | "perspectives"
  | "leaving-t3"
  | "late-night"
  | "leaving-t4"
  | "future"
  | "ending";

/** Telescope Story: T1 search → T3 perspectives → T4 late night → Future → visual ending. */
export function StoryTelescopeScene() {
  const {
    completeTelescopeStory,
    goToScene,
    telescopeStoryComplete,
    isDevStoryEntry,
    clearDevStoryEntry,
  } = useGame();
  const isReplay = useRef(telescopeStoryComplete).current;
  const enteredAsDev = useRef(isDevStoryEntry).current;
  const [phase, setPhase] = useState<TelescopePhase>("search");
  const [scopeGone, setScopeGone] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const [visualEndingComplete, setVisualEndingComplete] = useState(false);

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
            {...(phase === "future" ? { onStarfieldReady: () => setPhase("ending") } : {})}
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
            onExited={() => setPhase("future")}
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
            onExited={() => setPhase("late-night")}
          />
        </div>
      )}
      {(phase === "search" || phase === "leaving") && (
        <div className={`absolute inset-0 z-[4] ${phase === "leaving" ? "pointer-events-none" : ""}`}>
          <TelescopeSearch
            exiting={phase === "leaving"}
            onContinue={() => setPhase("leaving")}
            onExited={() => setPhase("perspectives")}
          />
        </div>
      )}
    </div>
  );
}
