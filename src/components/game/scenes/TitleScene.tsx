import { useEffect, useState } from "react";
import titleSky from "@/assets/title-sky.png";
import { RainOverlay } from "../RainOverlay";
import { useGame } from "@/game/GameContext";
import { clearSaveGame, loadSaveGame, type SaveGameState } from "@/game/saveGame";

const TITLE_BTN = "pixel-btn font-pixel px-6 py-4 text-xs md:text-sm";

export function TitleScene() {
  const { goToScene, hydrateSaveGame, startNewGame } = useGame();
  const [save, setSave] = useState<SaveGameState | null>(null);
  const [confirmingNew, setConfirmingNew] = useState(false);

  useEffect(() => {
    setSave(loadSaveGame());
  }, []);

  const showContinue = save != null && !save.progression.finalSequenceComplete;

  const onNewGame = () => {
    if (save) {
      setConfirmingNew(true);
      return;
    }
    goToScene("setup");
  };

  const onConfirmNewGame = () => {
    clearSaveGame();
    startNewGame();
  };

  return (
    <div
      className="relative h-full w-full"
      style={{
        backgroundImage: `url(${titleSky})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "saturate(0.6) brightness(0.92)",
      }}
    >
      <RainOverlay opacity={0.28} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "linear-gradient(180deg, rgba(90,110,140,0.35), rgba(70,85,115,0.55))" }}
      />

      <div className="relative z-30 flex h-full flex-col items-center justify-center gap-10 px-4">
        <div className="float-bob pixel-frame px-8 py-8 md:px-16 md:py-12">
          <h1 className="font-pixel text-center text-lg leading-relaxed text-parchment md:text-3xl">
            Something
            <br />
            About Jinn
          </h1>
        </div>

        {confirmingNew ? (
          <div className="flex flex-col items-center gap-4">
            <p className="font-pixel text-center text-xs leading-relaxed text-parchment md:text-sm">
              Start a new game?
              <br />
              Your current progress will be lost.
            </p>
            <button type="button" onClick={onConfirmNewGame} className={TITLE_BTN}>
              START NEW GAME
            </button>
            <button type="button" onClick={() => setConfirmingNew(false)} className={TITLE_BTN}>
              BACK
            </button>
          </div>
        ) : showContinue ? (
          <div className="flex flex-col items-center gap-4">
            <button type="button" onClick={() => hydrateSaveGame(save)} className={TITLE_BTN}>
              ▶ CONTINUE
            </button>
            <button type="button" onClick={onNewGame} className={TITLE_BTN}>
              ▶ NEW GAME
            </button>
          </div>
        ) : (
          <button type="button" onClick={onNewGame} className={TITLE_BTN}>
            ▶ NEW GAME
          </button>
        )}
      </div>
    </div>
  );
}
