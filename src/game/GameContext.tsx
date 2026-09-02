import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { FinalSequencePhase, GameState, SceneId } from "./types";
import { isHubSideItem } from "./items";
import {
  buildSaveGameState,
  deriveHeartsFromSaveProgression,
  writeSaveGame,
  type SaveCheckpoint,
  type SaveGameState,
} from "./saveGame";

/** Checkpoints this round is allowed to write. Photo 2–6 are mid-story scene starts. */
type WritableCheckpoint =
  | "hub"
  | "photo_scene_1"
  | "photo_scene_2"
  | "photo_scene_3"
  | "photo_scene_4"
  | "photo_scene_5"
  | "photo_scene_6"
  | "vase_scene_1"
  | "vase_scene_2"
  | "vase_feedback"
  | "vase_second_tender"
  | "vase_projects"
  | "vase_ability"
  | "telescope_search"
  | "telescope_perspectives"
  | "telescope_late_night"
  | "telescope_future"
  | "telescope_ending";

type PhotoSceneCheckpoint =
  | "photo_scene_2"
  | "photo_scene_3"
  | "photo_scene_4"
  | "photo_scene_5"
  | "photo_scene_6";

type VaseSceneCheckpoint =
  | "vase_scene_2"
  | "vase_feedback"
  | "vase_second_tender"
  | "vase_projects"
  | "vase_ability";

type TelescopeSceneCheckpoint =
  | "telescope_perspectives"
  | "telescope_late_night"
  | "telescope_future"
  | "telescope_ending";

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
  /**
   * Apply an already-validated save. Restores progression + outer scene
   * without fading and without reading localStorage.
   */
  hydrateSaveGame: (save: SaveGameState) => void;
  /** Reset this run and fade to Character Setup. Does not touch localStorage. */
  startNewGame: () => void;
  /** Session-only: this story open came from a DEV test click, not official unlock. */
  isDevStoryEntry: boolean;
  enterDevStory: (scene: SceneId) => void;
  clearDevStoryEntry: () => void;
  /**
   * One-shot Continue instruction. Not part of GameState / localStorage.
   * Story scenes may read this only to initialize their first mount.
   */
  pendingStoryResumeCheckpoint: SaveCheckpoint | null;
  /** Persist a Photo mid-story scene start. No-op for DEV / replay. */
  markPhotoSceneCheckpoint: (checkpoint: PhotoSceneCheckpoint) => void;
  /** Persist a Vase mid-story scene start. No-op for DEV / replay. */
  markVaseSceneCheckpoint: (checkpoint: VaseSceneCheckpoint) => void;
  /** Persist a Telescope mid-story phase start. No-op for DEV / replay. */
  markTelescopeSceneCheckpoint: (checkpoint: TelescopeSceneCheckpoint) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

/** Outer SceneId only. Story-internal phases are not restored this round. */
export function checkpointToScene(checkpoint: SaveCheckpoint): SceneId {
  switch (checkpoint) {
    case "hub":
    case "final_merchant":
    case "final_starfruit":
    case "final_celebration":
      return "hub";
    case "photo_scene_1":
    case "photo_scene_2":
    case "photo_scene_3":
    case "photo_scene_4":
    case "photo_scene_5":
    case "photo_scene_6":
      return "story-photo";
    case "vase_scene_1":
    case "vase_scene_2":
    case "vase_feedback":
    case "vase_second_tender":
    case "vase_projects":
    case "vase_ability":
      return "story-vase";
    case "telescope_search":
    case "telescope_perspectives":
    case "telescope_late_night":
    case "telescope_future":
    case "telescope_ending":
      return "story-telescope";
  }
}

function snapFinalSequenceForHydrate(save: SaveGameState): {
  scene: SceneId;
  finalRewardReady: boolean;
  finalSequenceStarted: boolean;
  finalSequenceComplete: boolean;
  finalSequencePhase: FinalSequencePhase;
} {
  const p = save.progression;

  if (p.finalSequenceComplete) {
    return {
      scene: "title",
      finalRewardReady: p.finalRewardReady,
      finalSequenceStarted: true,
      finalSequenceComplete: true,
      finalSequencePhase: "complete",
    };
  }

  if (save.checkpoint === "final_merchant") {
    return {
      scene: "hub",
      finalRewardReady: p.finalRewardReady,
      finalSequenceStarted: true,
      finalSequenceComplete: false,
      finalSequencePhase: "merchant",
    };
  }
  if (save.checkpoint === "final_starfruit") {
    return {
      scene: "hub",
      finalRewardReady: p.finalRewardReady,
      finalSequenceStarted: true,
      finalSequenceComplete: false,
      finalSequencePhase: "starfruit",
    };
  }
  if (save.checkpoint === "final_celebration") {
    return {
      scene: "hub",
      finalRewardReady: p.finalRewardReady,
      finalSequenceStarted: true,
      finalSequenceComplete: false,
      finalSequencePhase: "celebration",
    };
  }

  return {
    scene: checkpointToScene(save.checkpoint),
    finalRewardReady: p.finalRewardReady,
    finalSequenceStarted: p.finalSequenceStarted,
    finalSequenceComplete: false,
    finalSequencePhase: snapUnsafeFinalPhase(p.finalSequencePhase),
  };
}

/** Mid-animation beats are never restored; snap to the start of that ending beat. */
function snapUnsafeFinalPhase(phase: FinalSequencePhase): FinalSequencePhase {
  switch (phase) {
    case "starfruit-ready":
    case "eating":
    case "taste":
      return "starfruit";
    case "celebration-complete":
    case "hold":
    case "fade":
    case "end-title":
      return "celebration";
    default:
      return phase;
  }
}

function gameStateFromSave(save: SaveGameState): GameState {
  const p = save.progression;
  const ending = snapFinalSequenceForHydrate(save);
  return {
    playerName: save.playerName,
    favoriteThing: save.favoriteThing,
    hearts: deriveHeartsFromSaveProgression(p),
    maxHearts: INITIAL_STATE.maxHearts,
    hasMagnifier: p.hasMagnifier,
    inspectedItems: [],
    unlockedStories: [],
    photoStoryComplete: p.photoStoryComplete,
    vaseStoryComplete: p.vaseStoryComplete,
    telescopeStoryComplete: p.telescopeStoryComplete,
    pendingPhotoMerchantDialogue: p.pendingPhotoMerchantDialogue,
    pendingVaseMerchantDialogue: p.pendingVaseMerchantDialogue,
    pendingTelescopeMerchantDialogue: p.pendingTelescopeMerchantDialogue,
    viewedSideItems: [...p.viewedSideItems],
    finalRewardReady: ending.finalRewardReady,
    finalSequenceStarted: ending.finalSequenceStarted,
    finalSequenceComplete: ending.finalSequenceComplete,
    finalSequencePhase: ending.finalSequencePhase,
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [scene, setScene] = useState<SceneId>("title");
  const [isFading, setIsFading] = useState(false);
  const [isDevStoryEntry, setIsDevStoryEntry] = useState(false);
  const [pendingStoryResumeCheckpoint, setPendingStoryResumeCheckpoint] =
    useState<SaveCheckpoint | null>(null);
  const stateRef = useRef(state);
  const isDevStoryEntryRef = useRef(isDevStoryEntry);
  stateRef.current = state;
  isDevStoryEntryRef.current = isDevStoryEntry;

  const clearPendingStoryResume = useCallback(() => {
    setPendingStoryResumeCheckpoint(null);
  }, []);

  const saveCheckpoint = useCallback((gameState: GameState, checkpoint: WritableCheckpoint) => {
    if (isDevStoryEntryRef.current) return;
    writeSaveGame(buildSaveGameState(gameState, checkpoint));
  }, []);

  const markPhotoSceneCheckpoint = useCallback(
    (checkpoint: PhotoSceneCheckpoint) => {
      const current = stateRef.current;
      if (current.photoStoryComplete) return;
      saveCheckpoint(current, checkpoint);
    },
    [saveCheckpoint],
  );

  const markVaseSceneCheckpoint = useCallback(
    (checkpoint: VaseSceneCheckpoint) => {
      const current = stateRef.current;
      if (current.vaseStoryComplete) return;
      saveCheckpoint(current, checkpoint);
    },
    [saveCheckpoint],
  );

  const markTelescopeSceneCheckpoint = useCallback(
    (checkpoint: TelescopeSceneCheckpoint) => {
      const current = stateRef.current;
      if (current.telescopeStoryComplete) return;
      saveCheckpoint(current, checkpoint);
    },
    [saveCheckpoint],
  );

  const commitGameState = useCallback(
    (updater: (s: GameState) => GameState, checkpoint?: WritableCheckpoint) => {
      const prev = stateRef.current;
      const next = updater(prev);
      stateRef.current = next;
      setState(next);
      if (checkpoint && next !== prev) saveCheckpoint(next, checkpoint);
      return next;
    },
    [saveCheckpoint],
  );

  const goToScene = useCallback(
    (next: SceneId) => {
      clearPendingStoryResume();
      if (!isDevStoryEntryRef.current) {
        const current = stateRef.current;
        if (next === "hub") saveCheckpoint(current, "hub");
        else if (next === "story-photo" && !current.photoStoryComplete) {
          saveCheckpoint(current, "photo_scene_1");
        } else if (next === "story-vase" && !current.vaseStoryComplete) {
          saveCheckpoint(current, "vase_scene_1");
        } else if (next === "story-telescope" && !current.telescopeStoryComplete) {
          saveCheckpoint(current, "telescope_search");
        }
      }
      setIsFading(true);
      window.setTimeout(() => {
        setScene(next);
        window.setTimeout(() => setIsFading(false), 220);
      }, 700);
    },
    [saveCheckpoint, clearPendingStoryResume],
  );

  const startFinalSequence = useCallback(() => {
    commitGameState((s) => {
      if (s.finalSequenceStarted || s.finalSequenceComplete) return s;
      if (s.hearts < 10 || !s.finalRewardReady) return s;
      return {
        ...s,
        finalSequenceStarted: true,
        finalSequencePhase: "merchant",
      };
    });
  }, [commitGameState]);

  const setFinalSequencePhase = useCallback(
    (phase: FinalSequencePhase) => {
      commitGameState((s) => {
        if (!s.finalSequenceStarted || s.finalSequenceComplete) return s;
        if (s.finalSequencePhase === phase) return s;
        return { ...s, finalSequencePhase: phase };
      });
    },
    [commitGameState],
  );

  const completeFinalSequence = useCallback(() => {
    commitGameState((s) => {
      if (s.finalSequenceComplete) return s;
      return {
        ...s,
        finalSequenceComplete: true,
        finalSequencePhase: "complete",
      };
    });
  }, [commitGameState]);

  const resetGame = useCallback(() => {
    const initial = {
      ...INITIAL_STATE,
      inspectedItems: [],
      unlockedStories: [],
      viewedSideItems: [],
    };
    stateRef.current = initial;
    isDevStoryEntryRef.current = false;
    setState(initial);
    setPendingStoryResumeCheckpoint(null);
    setScene("title");
    setIsFading(false);
    setIsDevStoryEntry(false);
  }, []);

  const hydrateSaveGame = useCallback((save: SaveGameState) => {
    const ending = snapFinalSequenceForHydrate(save);
    const restored = gameStateFromSave(save);
    stateRef.current = restored;
    isDevStoryEntryRef.current = false;
    setState(restored);
    setPendingStoryResumeCheckpoint(save.checkpoint);
    setIsFading(false);
    setIsDevStoryEntry(false);
    setScene(ending.scene);
  }, []);

  const startNewGame = useCallback(() => {
    const initial = {
      ...INITIAL_STATE,
      inspectedItems: [],
      unlockedStories: [],
      viewedSideItems: [],
    };
    stateRef.current = initial;
    isDevStoryEntryRef.current = false;
    setState(initial);
    setPendingStoryResumeCheckpoint(null);
    setIsDevStoryEntry(false);
    setIsFading(true);
    window.setTimeout(() => {
      setScene("setup");
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
        commitGameState((s) => ({ ...s, playerName, favoriteThing })),
      giveMagnifier: () =>
        commitGameState((s) => (s.hasMagnifier ? s : { ...s, hasMagnifier: true }), "hub"),
      markInspected: (id) =>
        commitGameState((s) =>
          s.inspectedItems.includes(id) ? s : { ...s, inspectedItems: [...s.inspectedItems, id] },
        ),
      unlockStory: (id) =>
        commitGameState((s) =>
          s.unlockedStories.includes(id) ? s : { ...s, unlockedStories: [...s.unlockedStories, id] },
        ),
      addHeart: () =>
        commitGameState((s) => ({ ...s, hearts: Math.min(s.maxHearts, s.hearts + 1) })),
      completePhotoStory: () =>
        commitGameState((s) => {
          const next = {
            ...s,
            photoStoryComplete: true,
            pendingPhotoMerchantDialogue: true,
            hearts: 3,
            unlockedStories: s.unlockedStories.includes("photo")
              ? s.unlockedStories
              : [...s.unlockedStories, "photo"],
          };
          return next;
        }, "hub"),
      completeVaseStory: () =>
        commitGameState((s) => {
          return {
            ...s,
            vaseStoryComplete: true,
            pendingVaseMerchantDialogue: true,
            hearts: Math.max(s.hearts, 6),
            unlockedStories: s.unlockedStories.includes("vase")
              ? s.unlockedStories
              : [...s.unlockedStories, "vase"],
          };
        }, "hub"),
      completeTelescopeStory: () =>
        commitGameState((s) => {
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
        }, "hub"),
      clearPhotoMerchantDialogue: () =>
        commitGameState(
          (s) =>
            s.pendingPhotoMerchantDialogue ? { ...s, pendingPhotoMerchantDialogue: false } : s,
          "hub",
        ),
      clearVaseMerchantDialogue: () =>
        commitGameState(
          (s) => (s.pendingVaseMerchantDialogue ? { ...s, pendingVaseMerchantDialogue: false } : s),
          "hub",
        ),
      clearTelescopeMerchantDialogue: () =>
        commitGameState(
          (s) =>
            s.pendingTelescopeMerchantDialogue
              ? { ...s, pendingTelescopeMerchantDialogue: false }
              : s,
          "hub",
        ),
      markSideItemViewed: (id) =>
        commitGameState((s) => {
          if (!isHubSideItem(id) || s.viewedSideItems.includes(id)) return s;
          return { ...s, viewedSideItems: [...s.viewedSideItems, id] };
        }, "hub"),
      tryGrantFinalHeart: () =>
        commitGameState((s) => {
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
        }, "hub"),
      startFinalSequence,
      setFinalSequencePhase,
      completeFinalSequence,
      resetGame,
      hydrateSaveGame,
      startNewGame,
      isDevStoryEntry,
      pendingStoryResumeCheckpoint,
      markPhotoSceneCheckpoint,
      markVaseSceneCheckpoint,
      markTelescopeSceneCheckpoint,
      enterDevStory: (next) => {
        if (!import.meta.env.DEV) return;
        isDevStoryEntryRef.current = true;
        setIsDevStoryEntry(true);
        goToScene(next);
      },
      clearDevStoryEntry: () => {
        isDevStoryEntryRef.current = false;
        setIsDevStoryEntry(false);
      },
    }),
    [
      state,
      scene,
      isFading,
      goToScene,
      commitGameState,
      isDevStoryEntry,
      startFinalSequence,
      setFinalSequencePhase,
      completeFinalSequence,
      resetGame,
      hydrateSaveGame,
      startNewGame,
      pendingStoryResumeCheckpoint,
      markPhotoSceneCheckpoint,
      markVaseSceneCheckpoint,
      markTelescopeSceneCheckpoint,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
