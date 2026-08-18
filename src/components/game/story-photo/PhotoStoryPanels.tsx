interface PhotoStoryDialogueProps {
  text: string;
  onAdvance: () => void;
}

/** Click-through story text — matches DialogueBox pixel panel style, no speaker label. */
export function PhotoStoryDialogue({ text, onAdvance }: PhotoStoryDialogueProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-6 md:px-12 md:pb-10">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onAdvance();
        }}
        className="pixel-panel mx-auto block w-full max-w-3xl cursor-pointer px-6 py-5 text-left text-sm leading-8 md:px-8 md:text-base md:leading-9"
      >
        {text}
        <span className="float-right text-xs">▼</span>
      </button>
    </div>
  );
}

interface ProfilePanelProps {
  onDismiss: () => void;
}

export function ProfilePanel({ onDismiss }: ProfilePanelProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="pixel-frame w-full max-w-md p-4">
        <div className="pixel-panel px-5 py-5 text-sm leading-8">
          <p className="mb-4 text-plum">人物档案已更新</p>
          <p>
            出生地
            <br />
            内蒙古
          </p>
          <p className="mt-4">初始属性</p>
          <p className="mt-2 text-xs leading-7 md:text-sm">
            好奇心 ★★★★★
            <br />
            观察力 ★★★★★
            <br />
            想象力 ★★★★☆
          </p>
          <p className="mt-4 border-t-4 border-wood pt-4">人格类型：ENTP</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onDismiss} className="pixel-btn px-5 py-3 text-xs">
            继续
          </button>
        </div>
      </div>
    </div>
  );
}

interface MapUnlockPanelProps {
  variant: "imu" | "ntu";
  onDismiss: () => void;
}

export function MapUnlockPanel({ variant, onDismiss }: MapUnlockPanelProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
      <div className="pixel-frame w-full max-w-md p-4">
        <div className="pixel-panel px-5 py-5 text-sm leading-8">
          <p className="mb-4 text-plum">新地图已解锁</p>
          {variant === "imu" ? (
            <>
              <p className="text-base">内蒙古大学</p>
              <p>新闻学</p>
              <p>本科</p>
              <p className="mt-3 text-plum-light">211高校</p>
            </>
          ) : (
            <>
              <p className="text-base">南洋理工大学</p>
              <p className="text-xs text-ink/80">Nanyang Technological University</p>
              <p className="mt-3">媒体与传播</p>
              <p className="text-xs text-ink/80">Media &amp; Communication</p>
              <p className="mt-3">硕士</p>
            </>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onDismiss} className="pixel-btn px-5 py-3 text-xs">
            继续
          </button>
        </div>
      </div>
    </div>
  );
}

interface MemoryCompletePanelProps {
  onFinish: () => void;
}

export function MemoryCompletePanel({ onFinish }: MemoryCompletePanelProps) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 px-4">
      <div className="pixel-frame w-full max-w-lg p-5">
        <div className="pixel-panel px-6 py-8 text-center text-sm leading-10 md:text-base">
          第一段记忆已拼凑完成
        </div>
        <div className="mt-4 flex justify-center">
          <button type="button" onClick={onFinish} className="pixel-btn px-6 py-3 text-xs">
            返回
          </button>
        </div>
      </div>
    </div>
  );
}
