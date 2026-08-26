import "./telescope-story.css";

interface TelescopeSecretNoteProps {
  onClose: () => void;
  onReplay: () => void;
}

/** Hidden note revealed by double-clicking the telescope after Telescope Story. */
export function TelescopeSecretNote({ onClose, onReplay }: TelescopeSecretNoteProps) {
  const tags = ["HUMAN", "PRODUCT", "TECHNOLOGY"];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
      <div className="pixel-frame w-full max-w-lg p-4">
        <div className="ts-secret-paper px-6 py-6 text-sm leading-8 text-ink md:text-base">
          <h2 className="mb-4 text-base text-plum">秘密纸条 · 叁</h2>
          <p>“具体的岗位会变。</p>
          <p className="mt-3">但她越来越清楚，自己想站在哪些问题的交界处。”</p>
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
