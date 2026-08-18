import titleSky from "@/assets/title-sky.png";
import { RainOverlay } from "../RainOverlay";
import { useGame } from "@/game/GameContext";

export function TitleScene() {
  const { goToScene } = useGame();

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

        <button
          type="button"
          onClick={() => goToScene("setup")}
          className="pixel-btn font-pixel px-6 py-4 text-xs md:text-sm"
        >
          ▶ NEW GAME
        </button>
      </div>
    </div>
  );
}
