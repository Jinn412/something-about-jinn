import { useGame } from "@/game/GameContext";

/** DEV-only stub so Hub can open Telescope without an official story yet. */
export function StoryTelescopeScene() {
  const { goToScene, clearDevStoryEntry } = useGame();

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[oklch(0.16_0.03_250)]">
      <div className="pixel-frame max-w-md p-6">
        <div className="pixel-panel px-5 py-5 text-sm leading-8">
          <p className="mb-3 text-xs text-plum">DEV</p>
          <p>Telescope Story 尚未制作。</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="pixel-btn px-5 py-3 text-xs"
            onClick={() => {
              clearDevStoryEntry();
              goToScene("hub");
            }}
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
}
