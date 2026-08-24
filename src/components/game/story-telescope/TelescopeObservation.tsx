import { useEffect, useRef, useState } from "react";
import ntuArt from "@/assets/ntu.png";
import { DialogueBox } from "../DialogueBox";
import "./telescope-story.css";

const HOLD_MS = 800;
const AFTER_LINE1_MS = 300;
const TOPIC_STAGGER_MS = 400;
const TOPIC_IN_MS = 320;
const AFTER_TOPICS_MS = 600;

const LINE_1 = [{ speaker: "", text: "换一个环境，也换一套观察方法。" }];
const LINE_2 = [{ speaker: "", text: "原本分开的议题，开始出现在同一个视野里。" }];

const TOPICS = [
  { id: "传播", left: "12%", top: "22%" },
  { id: "数据", left: "73%", top: "17%" },
  { id: "AI", left: "47%", top: "58%" },
  { id: "交互", left: "18%", top: "62%" },
  { id: "技术与社会", left: "69%", top: "69%" },
] as const;

type Phase = "idle" | "line1" | "topics" | "line2" | "rest";

/** Telescope Story Scene 02: OBSERVATION 01 · NTU. Stops after the second line. */
export function TelescopeObservation({ revealed }: { revealed: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const id = window.setTimeout(() => setPhase("line1"), HOLD_MS);
    timers.current.push(id);
    return () => window.clearTimeout(id);
  }, [revealed]);

  const afterLine1 = () => {
    setPhase("idle");
    const id = window.setTimeout(() => setPhase("topics"), AFTER_LINE1_MS);
    timers.current.push(id);
  };

  useEffect(() => {
    if (phase !== "topics") return;
    const wait = (TOPICS.length - 1) * TOPIC_STAGGER_MS + TOPIC_IN_MS + AFTER_TOPICS_MS;
    const id = window.setTimeout(() => setPhase("line2"), wait);
    timers.current.push(id);
    return () => window.clearTimeout(id);
  }, [phase]);

  const afterLine2 = () => setPhase("rest");

  const showTopics = phase === "topics" || phase === "line2" || phase === "rest";

  return (
    <div className={`telescope-observation ${revealed ? "is-revealed" : "is-entering"}`}>
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="telescope-obs-stage relative aspect-[1536/1024] h-auto min-h-full w-auto min-w-full">
          <img
            src={ntuArt}
            alt=""
            width={1536}
            height={1024}
            draggable={false}
            className="telescope-obs-sky"
          />

          <div className="telescope-obs-label">
            <p>OBSERVATION 01</p>
            <p>NTU · SINGAPORE</p>
          </div>

          {showTopics && (
            <div className="telescope-obs-topics">
              {TOPICS.map((topic) => (
                <span
                  key={topic.id}
                  className="telescope-topic"
                  style={{ left: topic.left, top: topic.top }}
                >
                  <i className="telescope-topic-mark" aria-hidden />
                  {topic.id}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {phase === "line1" && (
        <div className="telescope-dialogue">
          <DialogueBox lines={LINE_1} onFinish={afterLine1} />
        </div>
      )}

      {phase === "line2" && (
        <div className="telescope-dialogue">
          <DialogueBox lines={LINE_2} onFinish={afterLine2} />
        </div>
      )}
    </div>
  );
}
