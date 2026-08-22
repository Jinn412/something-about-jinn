import { useEffect, useState } from "react";
import type { DialogueLine } from "@/game/types";

interface DialogueBoxProps {
  lines: DialogueLine[];
  onFinish?: () => void;
  instant?: boolean;
}

/** Click-through pixel dialogue box. Feed it any DialogueLine[] script. */
export function DialogueBox({ lines, onFinish, instant = false }: DialogueBoxProps) {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const line = lines[index];

  useEffect(() => {
    if (!line) return;
    if (instant) {
      setTyped(line.text);
      return;
    }
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(line.text.slice(0, i));
      if (i >= line.text.length) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [line, instant]);

  if (!line) return null;

  const done = typed.length >= line.text.length;

  const advance = () => {
    if (!done) {
      setTyped(line.text);
      return;
    }
    if (index + 1 >= lines.length) {
      onFinish?.();
      return;
    }
    setIndex(index + 1);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-6 md:px-16 md:pb-10">
      {line.reward && done && (
        <div className="mx-auto mb-4 w-fit">
          <div className="pixel-panel zoom-in-pixel flex items-center gap-4 px-6 py-4">
            <span className="text-4xl leading-none">{line.reward.icon}</span>
            <span className="text-sm md:text-base">{line.reward.label}</span>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-3xl">
        <div className="pixel-frame absolute -top-7 left-6 px-4 py-1 text-xs text-parchment md:text-sm">
          {line.speaker}
        </div>
        <button
          type="button"
          onClick={advance}
          className="pixel-panel block w-full cursor-pointer px-6 py-6 text-left text-sm leading-8 md:px-8 md:text-lg md:leading-10"
        >
          {typed}
          <span className="absolute bottom-3 right-5 text-xs">{done ? "▼" : "…"}</span>
        </button>
      </div>
    </div>
  );
}
