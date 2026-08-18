import { useState } from "react";
import titleSky from "@/assets/title-sky.png";
import { RainOverlay } from "../RainOverlay";
import { useGame } from "@/game/GameContext";

export function CharacterSetupScene() {
  const { setPlayer, goToScene } = useGame();
  const [name, setName] = useState("");
  const [favorite, setFavorite] = useState("");

  const confirm = () => {
    setPlayer(name, favorite);
    goToScene("hub");
  };

  return (
    <div
      className="relative h-full w-full"
      style={{
        backgroundImage: `url(${titleSky})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "saturate(0.5) brightness(0.8)",
      }}
    >
      <RainOverlay opacity={0.22} />

      <div className="relative z-30 flex h-full items-center justify-center px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            confirm();
          }}
          className="pixel-frame w-full max-w-xl p-6 md:p-8"
        >
          <div className="pixel-panel px-6 py-6 md:px-8">
            <p className="mb-6 text-xs md:text-sm">＊ 请填写你的旅人档案</p>

            <label className="block text-sm md:text-base" htmlFor="player-name">
              你的名字：
            </label>
            <input
              id="player-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={12}
              className="pixel-input mt-2 w-full px-4 py-3 text-sm md:text-base"
            />

            <label className="mt-6 block text-sm md:text-base" htmlFor="player-favorite">
              你最喜爱的事物：
            </label>
            <input
              id="player-favorite"
              value={favorite}
              onChange={(e) => setFavorite(e.target.value)}
              maxLength={16}
              className="pixel-input mt-2 w-full px-4 py-3 text-sm md:text-base"
            />
          </div>

          <div className="mt-6 flex justify-center">
            <button type="submit" className="pixel-btn px-8 py-3 text-xs md:text-sm">
              [ 确认 ]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
