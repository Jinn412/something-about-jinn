import { useState } from "react";
import { GameProvider, useGame } from "@/game/GameContext";
import { isFinalPreview } from "@/game/finalPreview";
import type { FinalSequencePhase } from "@/game/types";
import { HeartBar } from "./HeartBar";
import { TitleScene } from "./scenes/TitleScene";
import { CharacterSetupScene } from "./scenes/CharacterSetupScene";
import { HubScene } from "./scenes/HubScene";
import { StoryPhotoScene } from "./scenes/StoryPhotoScene";
import { StoryVaseScene } from "./scenes/StoryVaseScene";
import { StoryTelescopeScene } from "./scenes/StoryTelescopeScene";

function SceneSwitch() {
  const previewUrl = isFinalPreview();
  const [previewExited, setPreviewExited] = useState(false);
  const preview = previewUrl && !previewExited;
  const { scene, isFading, hearts, maxHearts, finalSequencePhase } = useGame();
  const [previewPhase, setPreviewPhase] = useState<FinalSequencePhase>("none");

  const displayHearts = preview ? 10 : hearts;
  const pulsePhase = preview ? previewPhase : finalSequencePhase;
  const showHearts =
    preview ||
    ((scene === "hub" ||
      scene === "story-photo" ||
      scene === "story-vase" ||
      scene === "story-telescope") &&
      !isFading);

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <div className={`scene-fade h-full w-full ${isFading ? "opacity-0" : "opacity-100"}`}>
        {preview ? (
          <HubScene
            onPreviewPhase={setPreviewPhase}
            onExitPreview={() => setPreviewExited(true)}
          />
        ) : (
          <>
            {scene === "title" && <TitleScene />}
            {scene === "setup" && <CharacterSetupScene />}
            {scene === "hub" && <HubScene />}
            {scene === "story-photo" && <StoryPhotoScene />}
            {scene === "story-vase" && <StoryVaseScene />}
            {scene === "story-telescope" && <StoryTelescopeScene />}
          </>
        )}
      </div>

      {showHearts && (
        <HeartBar
          hearts={displayHearts}
          maxHearts={maxHearts}
          pulse={pulsePhase === "celebration"}
        />
      )}
    </main>
  );
}

export function GameRoot() {
  return (
    <GameProvider>
      <SceneSwitch />
    </GameProvider>
  );
}
