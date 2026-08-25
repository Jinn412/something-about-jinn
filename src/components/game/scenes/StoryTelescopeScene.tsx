import { useState } from "react";
import { TelescopeLateNight } from "../story-telescope/TelescopeLateNight";
import { TelescopePerspectives } from "../story-telescope/TelescopePerspectives";
import { TelescopeSearch } from "../story-telescope/TelescopeSearch";

type TelescopePhase = "search" | "leaving" | "perspectives" | "leaving-t3" | "late-night" | "future-placeholder";

/** Telescope Story: T1 search → T3 perspectives → T4 late night. */
export function StoryTelescopeScene() {
  const [phase, setPhase] = useState<TelescopePhase>("search");

  return (
    <div className="relative h-full w-full overflow-hidden">
      {(phase === "leaving-t3" || phase === "late-night" || phase === "future-placeholder") && (
        <div className={`absolute inset-0 z-[1] ${phase === "leaving-t3" ? "pointer-events-none" : ""}`}>
          <TelescopeLateNight
            onContinue={phase === "late-night" ? () => setPhase("future-placeholder") : undefined}
          />
        </div>
      )}
      {(phase === "leaving" || phase === "perspectives" || phase === "leaving-t3") && (
        <div
          className={`absolute inset-0 z-[2] ${phase === "leaving" || phase === "leaving-t3" ? "pointer-events-none" : ""}`}
        >
          <TelescopePerspectives
            exiting={phase === "leaving-t3"}
            onContinue={() => setPhase("leaving-t3")}
            onExited={() => setPhase("late-night")}
          />
        </div>
      )}
      {(phase === "search" || phase === "leaving") && (
        <div className={`absolute inset-0 z-[3] ${phase === "leaving" ? "pointer-events-none" : ""}`}>
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
