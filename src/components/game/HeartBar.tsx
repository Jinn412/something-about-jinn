import { useEffect, useState } from "react";

interface HeartBarProps {
  hearts: number;
  maxHearts: number;
}

/** Retro affection HUD — fills new hearts one at a time when count increases. */
export function HeartBar({ hearts, maxHearts }: HeartBarProps) {
  const [displayed, setDisplayed] = useState(hearts);

  useEffect(() => {
    if (hearts < displayed) {
      setDisplayed(hearts);
      return;
    }
    if (hearts === displayed) return;
    const id = window.setTimeout(() => {
      setDisplayed((current) => Math.min(hearts, current + 1));
    }, 420);
    return () => window.clearTimeout(id);
  }, [hearts, displayed]);

  return (
    <div className="pointer-events-none fixed left-4 top-4 z-30 flex gap-1 md:gap-2">
      {Array.from({ length: maxHearts }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className="text-xl leading-none text-heart md:text-2xl"
          style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.6)" }}
        >
          {i < displayed ? "♥" : "♡"}
        </span>
      ))}
      <span className="sr-only">
        好感度 {displayed} / {maxHearts}
      </span>
    </div>
  );
}
