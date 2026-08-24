import { useState } from "react";
import { TelescopeObservation } from "../story-telescope/TelescopeObservation";
import { TelescopeSearch } from "../story-telescope/TelescopeSearch";

type TelescopePhase = "search" | "leaving" | "observation";

/** Telescope Story: Scene 01 search → Scene 02 observation. */
export function StoryTelescopeScene() {
  const [phase, setPhase] = useState<TelescopePhase>("search");

  return (
    <div className="relative h-full w-full overflow-hidden">
      {(phase === "leaving" || phase === "observation") && (
        <div className="absolute inset-0 z-[1]">
          <TelescopeObservation revealed={phase === "observation"} />
        </div>
      )}
      {(phase === "search" || phase === "leaving") && (
        <div className={`absolute inset-0 z-[2] ${phase === "leaving" ? "pointer-events-none" : ""}`}>
          <TelescopeSearch
            exiting={phase === "leaving"}
            onContinue={() => setPhase("leaving")}
            onExited={() => setPhase("observation")}
          />
        </div>
      )}
    </div>
  );
}
