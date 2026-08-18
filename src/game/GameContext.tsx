import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { GameState, SceneId } from "./types";

const INITIAL_STATE: GameState = {
  playerName: "",
  favoriteThing: "",
  hearts: 0,
  maxHearts: 10,
  hasMagnifier: false,
  inspectedItems: [],
  unlockedStories: [],
  photoStoryComplete: false,
  pendingPhotoMerchantDialogue: false,
};

interface GameContextValue extends GameState {
  scene: SceneId;
  /** fades out, then switches scene, then fades in */
  goToScene: (scene: SceneId) => void;
  isFading: boolean;
  setPlayer: (name: string, favoriteThing: string) => void;
  giveMagnifier: () => void;
  markInspected: (id: string) => void;
  unlockStory: (id: string) => void;
  addHeart: () => void;
  completePhotoStory: () => void;
  clearPhotoMerchantDialogue: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [scene, setScene] = useState<SceneId>("title");
  const [isFading, setIsFading] = useState(false);

  const goToScene = useCallback((next: SceneId) => {
    setIsFading(true);
    window.setTimeout(() => {
      setScene(next);
      window.setTimeout(() => setIsFading(false), 220);
    }, 700);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      ...state,
      scene,
      isFading,
      goToScene,
      setPlayer: (playerName, favoriteThing) =>
        setState((s) => ({ ...s, playerName, favoriteThing })),
      giveMagnifier: () => setState((s) => ({ ...s, hasMagnifier: true })),
      markInspected: (id) =>
        setState((s) =>
          s.inspectedItems.includes(id)
            ? s
            : { ...s, inspectedItems: [...s.inspectedItems, id] },
        ),
      unlockStory: (id) =>
        setState((s) =>
          s.unlockedStories.includes(id)
            ? s
            : { ...s, unlockedStories: [...s.unlockedStories, id] },
        ),
      addHeart: () =>
        setState((s) => ({ ...s, hearts: Math.min(s.maxHearts, s.hearts + 1) })),
      completePhotoStory: () =>
        setState((s) => ({
          ...s,
          photoStoryComplete: true,
          pendingPhotoMerchantDialogue: true,
          hearts: 3,
          unlockedStories: s.unlockedStories.includes("photo")
            ? s.unlockedStories
            : [...s.unlockedStories, "photo"],
        })),
      clearPhotoMerchantDialogue: () =>
        setState((s) => ({ ...s, pendingPhotoMerchantDialogue: false })),
    }),
    [state, scene, isFading, goToScene],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
