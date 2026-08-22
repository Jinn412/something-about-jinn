import { GameProvider, useGame } from "@/game/GameContext";
import { HeartBar } from "./HeartBar";
import { TitleScene } from "./scenes/TitleScene";
import { CharacterSetupScene } from "./scenes/CharacterSetupScene";
import { HubScene } from "./scenes/HubScene";
import { StoryPhotoScene } from "./scenes/StoryPhotoScene";
import { StoryVaseScene } from "./scenes/StoryVaseScene";
import { StoryTelescopeScene } from "./scenes/StoryTelescopeScene";

function SceneSwitch() {
  const { scene, isFading, hearts, maxHearts } = useGame();

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <div className={`scene-fade h-full w-full ${isFading ? "opacity-0" : "opacity-100"}`}>
        {scene === "title" && <TitleScene />}
        {scene === "setup" && <CharacterSetupScene />}
        {scene === "hub" && <HubScene />}
        {scene === "story-photo" && <StoryPhotoScene />}
        {scene === "story-vase" && <StoryVaseScene />}
        {scene === "story-telescope" && <StoryTelescopeScene />}
      </div>

      {(scene === "hub" ||
        scene === "story-photo" ||
        scene === "story-vase" ||
        scene === "story-telescope") &&
        !isFading && (
        <HeartBar hearts={hearts} maxHearts={maxHearts} />
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
