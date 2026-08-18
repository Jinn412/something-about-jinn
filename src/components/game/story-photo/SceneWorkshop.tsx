import { useRef, useState, type ReactNode } from "react";
import workshopArt from "@/assets/workshop.png";
import noteMediaArt from "@/assets/notemedia.png";
import noteQuestionArt from "@/assets/notequestion.png";
import noteStoryArt from "@/assets/notestory.png";

const SCENE_W = 1536;
const SCENE_H = 1024;

/** Percent of the 1536×1024 scene box. width only; height follows source aspect. */
const NOTE_MEDIA = {
  left: "7.2%",
  top: "12%",
  width: "16.5%",
  fromRot: "-2deg",
  toRot: "-0.8deg",
} as const;

const NOTE_QUESTION = {
  left: "71.5%",
  top: "7.5%",
  width: "17%",
  fromRot: "1deg",
  toRot: "1.3deg",
} as const;

const NOTE_STORY = {
  left: "73.8%",
  top: "33%",
  width: "16.5%",
  fromRot: "-1.5deg",
  toRot: "0.7deg",
} as const;

export function SceneWorkshop({
  noteStage,
  throughCam = "idle",
}: {
  noteStage: 0 | 1 | 2 | 3;
  throughCam?: "idle" | "push" | "punch";
}) {
  const stuck = useRef({ media: false, question: false, story: false });
  const [, setRev] = useState(0);
  const mark = (id: "media" | "question" | "story") => {
    if (stuck.current[id]) return;
    stuck.current[id] = true;
    setRev((n) => n + 1);
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className={`relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full overflow-hidden${
            throughCam === "push" ? " ps-s6-through-push" : throughCam === "punch" ? " ps-s6-through-punch" : ""
          }`}
        >
          <img
            src={workshopArt}
            alt=""
            width={SCENE_W}
            height={SCENE_H}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {noteStage >= 1 && (
            <WallNote
              className="ps-s5-note-media"
              pose={NOTE_MEDIA}
              delayMs={280}
              stuck={stuck.current.media}
              onStuck={() => mark("media")}
            >
              <img
                src={noteMediaArt}
                alt=""
                draggable={false}
                className="block h-auto w-full"
              />
            </WallNote>
          )}

          {noteStage >= 2 && (
            <WallNote
              className="ps-s5-note-question"
              pose={NOTE_QUESTION}
              delayMs={350}
              stuck={stuck.current.question}
              onStuck={() => mark("question")}
            >
              <img
                src={noteQuestionArt}
                alt=""
                draggable={false}
                className="block h-auto w-full"
              />
            </WallNote>
          )}

          {noteStage >= 2 && (
            <WallNote
              className="ps-s5-note-story"
              pose={NOTE_STORY}
              delayMs={1400}
              stuck={stuck.current.story}
              onStuck={() => mark("story")}
            >
              <img
                src={noteStoryArt}
                alt=""
                draggable={false}
                className="block h-auto w-full"
              />
            </WallNote>
          )}

          {noteStage >= 3 && throughCam === "idle" && (
            <div
              className="pointer-events-none absolute ps-s5-screen-breathe"
              style={{ left: "31%", top: "13%", width: "39%", height: "49%" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function WallNote({
  className,
  pose,
  delayMs,
  stuck,
  onStuck,
  children,
}: {
  className: string;
  pose: {
    left: string;
    top: string;
    width: string;
    fromRot: string;
    toRot: string;
  };
  delayMs: number;
  stuck: boolean;
  onStuck: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`pointer-events-none absolute ${className}${stuck ? " ps-s5-note-on" : " ps-s5-note-stick"}`}
      style={{
        left: pose.left,
        top: pose.top,
        width: pose.width,
        height: "auto",
        ["--note-from" as string]: pose.fromRot,
        ["--note-to" as string]: pose.toRot,
        animationDelay: stuck ? "0ms" : `${delayMs}ms`,
      }}
      onAnimationEnd={onStuck}
    >
      {children}
    </div>
  );
}
