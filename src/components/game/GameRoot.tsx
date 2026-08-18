import { GameProvider, useGame } from "@/game/GameContext";
import { HeartBar } from "./HeartBar";
import { TitleScene } from "./scenes/TitleScene";
import { CharacterSetupScene } from "./scenes/CharacterSetupScene";
import { HubScene } from "./scenes/HubScene";
import { StoryPhotoScene } from "./scenes/StoryPhotoScene";

function SceneSwitch() {
  const { scene, isFading, hearts, maxHearts } = useGame();

  return (
    <main className="relative h-screen w-full overflow-hidden">
      <div className={`scene-fade h-full w-full ${isFading ? "opacity-0" : "opacity-100"}`}>
        {scene === "title" && <TitleScene />}
        {scene === "setup" && <CharacterSetupScene />}
        {scene === "hub" && <HubScene />}
        {scene === "story-photo" && <StoryPhotoScene />}
      </div>

      {(scene === "hub" || scene === "story-photo") && !isFading && (
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
