import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FinalSequencePhase, GameState, SceneId } from "./types";
import { isHubSideItem } from "./items";

const INITIAL_STATE: GameState = {
  playerName: "",
  favoriteThing: "",
  hearts: 0,
  maxHearts: 10,
  hasMagnifier: false,
  inspectedItems: [],
  unlockedStories: [],
  photoStoryComplete: false,
  vaseStoryComplete: false,
  telescopeStoryComplete: false,
  pendingPhotoMerchantDialogue: false,
  pendingVaseMerchantDialogue: false,
  pendingTelescopeMerchantDialogue: false,
  viewedSideItems: [],
  finalRewardReady: false,
  finalSequenceStarted: false,
  finalSequenceComplete: false,
  finalSequencePhase: "none",
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
  completeVaseStory: () => void;
  completeTelescopeStory: () => void;
  clearPhotoMerchantDialogue: () => void;
  clearVaseMerchantDialogue: () => void;
  clearTelescopeMerchantDialogue: () => void;
  markSideItemViewed: (id: string) => void;
  tryGrantFinalHeart: () => void;
  startFinalSequence: () => void;
  setFinalSequencePhase: (phase: FinalSequencePhase) => void;
  completeFinalSequence: () => void;
  /** Clear this run's progression and return to the title / New Game screen. */
  resetGame: () => void;
  /** Session-only: this story open came from a DEV test click, not official unlock. */
  isDevStoryEntry: boolean;
  enterDevStory: (scene: SceneId) => void;
  clearDevStoryEntry: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [scene, setScene] = useState<SceneId>("title");
  const [isFading, setIsFading] = useState(false);
  const [isDevStoryEntry, setIsDevStoryEntry] = useState(false);

  const goToScene = useCallback((next: SceneId) => {
    setIsFading(true);
    window.setTimeout(() => {
      setScene(next);
      window.setTimeout(() => setIsFading(false), 220);
    }, 700);
  }, []);

  const startFinalSequence = useCallback(() => {
    setState((s) => {
      if (s.finalSequenceStarted || s.finalSequenceComplete) return s;
      if (s.hearts < 10 || !s.finalRewardReady) return s;
      return {
        ...s,
        finalSequenceStarted: true,
        finalSequencePhase: "merchant",
      };
    });
  }, []);

  const setFinalSequencePhase = useCallback((phase: FinalSequencePhase) => {
    setState((s) => {
      if (!s.finalSequenceStarted || s.finalSequenceComplete) return s;
      if (s.finalSequencePhase === phase) return s;
      return { ...s, finalSequencePhase: phase };
    });
  }, []);

  const completeFinalSequence = useCallback(() => {
    setState((s) => {
      if (s.finalSequenceComplete) return s;
      return {
        ...s,
        finalSequenceComplete: true,
        finalSequencePhase: "complete",
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      inspectedItems: [],
      unlockedStories: [],
      viewedSideItems: [],
    });
    setScene("title");
    setIsFading(false);
    setIsDevStoryEntry(false);
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
      completeVaseStory: () =>
        setState((s) => ({
          ...s,
          vaseStoryComplete: true,
          pendingVaseMerchantDialogue: true,
          hearts: Math.max(s.hearts, 6),
          unlockedStories: s.unlockedStories.includes("vase")
            ? s.unlockedStories
            : [...s.unlockedStories, "vase"],
        })),
      completeTelescopeStory: () =>
        setState((s) => {
          if (s.telescopeStoryComplete) return s;
          return {
            ...s,
            telescopeStoryComplete: true,
            pendingTelescopeMerchantDialogue: true,
            hearts: Math.max(s.hearts, 9),
            unlockedStories: s.unlockedStories.includes("telescope")
              ? s.unlockedStories
              : [...s.unlockedStories, "telescope"],
          };
        }),
      clearPhotoMerchantDialogue: () =>
        setState((s) => ({ ...s, pendingPhotoMerchantDialogue: false })),
      clearVaseMerchantDialogue: () =>
        setState((s) => ({ ...s, pendingVaseMerchantDialogue: false })),
      clearTelescopeMerchantDialogue: () =>
        setState((s) => ({ ...s, pendingTelescopeMerchantDialogue: false })),
      markSideItemViewed: (id) =>
        setState((s) => {
          if (!isHubSideItem(id) || s.viewedSideItems.includes(id)) return s;
          return { ...s, viewedSideItems: [...s.viewedSideItems, id] };
        }),
      tryGrantFinalHeart: () =>
        setState((s) => {
          const allMainStoriesComplete =
            s.photoStoryComplete && s.vaseStoryComplete && s.telescopeStoryComplete;
          const enoughSideItemsViewed = s.viewedSideItems.length >= 3;
          if (!allMainStoriesComplete || !enoughSideItemsViewed) return s;
          if (s.hearts >= 10 && s.finalRewardReady) return s;
          return {
            ...s,
            hearts: Math.max(s.hearts, 10),
            finalRewardReady: true,
          };
        }),
      startFinalSequence,
      setFinalSequencePhase,
      completeFinalSequence,
      resetGame,
      isDevStoryEntry,
      enterDevStory: (next) => {
        if (!import.meta.env.DEV) return;
        setIsDevStoryEntry(true);
        goToScene(next);
      },
      clearDevStoryEntry: () => setIsDevStoryEntry(false),
    }),
    [
      state,
      scene,
      isFading,
      goToScene,
      isDevStoryEntry,
      startFinalSequence,
      setFinalSequencePhase,
      completeFinalSequence,
      resetGame,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
