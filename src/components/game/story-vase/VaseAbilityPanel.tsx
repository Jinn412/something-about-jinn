import { useEffect, useRef, useState } from "react";
import "./vase-mobile-landscape.css";

const SKILLS = [
  {
    name: "叙事策划",
    detail: "把复杂信息组织成清晰、可体验的故事。",
  },
  {
    name: "需求拆解",
    detail: "从招标文件和客户需求中找到真正的问题。",
  },
  {
    name: "招投标",
    detail: "读标、搭框架、写方案、做 PPT、参与述标。",
  },
  {
    name: "沟通协调",
    detail: "连接客户、项目、设计与技术，把意见变成下一步。",
  },
  {
    name: "跨团队协作",
    detail: "在时间、预算与实现限制中推动方案向前。",
  },
] as const;

const TITLE_WAIT_MS = 300;
const STEP_MS = 650;
const ROW_IN_MS = 300;
const AFTER_LAST_MS = 1000;

interface VaseAbilityPanelProps {
  onDismiss: () => void;
}

/** Vase Scene 3 close: ability archive update. Visual echo of Photo ProfilePanel. */
export function VaseAbilityPanel({ onDismiss }: VaseAbilityPanelProps) {
  const [shown, setShown] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);
  const dismissed = useRef(false);

  useEffect(() => {
    const later = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    for (let i = 0; i < SKILLS.length; i += 1) {
      later(() => setShown(i + 1), TITLE_WAIT_MS + STEP_MS * i);
    }
    later(
      () => setShowContinue(true),
      TITLE_WAIT_MS + STEP_MS * (SKILLS.length - 1) + ROW_IN_MS + AFTER_LAST_MS,
    );

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  const dismiss = () => {
    if (dismissed.current || !showContinue) return;
    dismissed.current = true;
    setLeaving(true);
    const id = window.setTimeout(() => onDismiss(), 300);
    timers.current.push(id);
  };

  return (
    <div
      className={`vs-ability-root absolute inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 ${
        leaving ? "vs-ability-out" : ""
      }`}
    >
      <div className="vs-ability-frame pixel-frame w-full max-w-[560px] p-4">
        <div className="vs-ability-body pixel-panel px-5 py-5 text-sm leading-8">
          <p className="vs-ability-header mb-4 text-plum">能力档案已更新</p>
          <div className="vs-ability-content">
            {SKILLS.slice(0, shown).map((skill, i) => (
              <p key={skill.name} className={`vs-ability-row ${i === 0 ? "" : "mt-4"}`}>
                <span className="text-plum">{skill.name}</span>
                <br />
                {skill.detail}
              </p>
            ))}
          </div>
        </div>
        {showContinue && (
          <div className="vs-ability-footer mt-4 flex justify-end">
            <button type="button" onClick={dismiss} className="pixel-btn px-5 py-3 text-xs">
              继续
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
