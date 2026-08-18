interface PhotoSecretNoteProps {
  onClose: () => void;
  onReplay: () => void;
}

/** Hidden note revealed by double-clicking the photo after Story 01. */
export function PhotoSecretNote({ onClose, onReplay }: PhotoSecretNoteProps) {
  const tags = [
    "内蒙古",
    "内蒙古大学",
    "新闻学",
    "211高校",
    "好奇",
    "创造",
    "ENTP",
    "南洋理工大学",
    "媒体与传播",
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="pixel-frame w-full max-w-lg p-4">
        <div className="ps-secret-paper px-6 py-6 text-sm leading-8 text-ink md:text-base">
          <h2 className="mb-4 text-base text-plum">秘密纸条 · 壹</h2>
          <p>“她一直在往外走。</p>
          <p className="mt-3">
            从草原到城市，
            <br />
            从熟悉的地方到陌生的地图。
          </p>
          <p className="mt-3">不是因为她已经知道前方有什么。</p>
          <p className="mt-3">恰恰相反。</p>
          <p className="mt-3">
            是因为她总觉得，
            <br />
            下一个未知的地方，
            <br />
            可能还有更大的世界。”
          </p>
          <div className="mt-6 flex flex-wrap gap-2 border-t-4 border-wood/40 pt-4 text-xs leading-6">
            {tags.map((tag) => (
              <span key={tag} className="border-2 border-wood-dark bg-parchment-dark/50 px-2 py-1">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={onReplay} className="pixel-btn px-5 py-3 text-xs">
            重新播放
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border-4 border-wood-dark bg-wood/70 px-5 py-3 text-xs text-parchment shadow-[inset_-4px_-4px_0_0_oklch(0_0_0/35%),inset_4px_4px_0_0_oklch(1_0_0/12%)]"
          >
            收起
          </button>
        </div>
      </div>
    </div>
  );
}
