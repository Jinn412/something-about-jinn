import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

const SCENE_ASPECT = 1536 / 1024;

export type PanTarget = {
  id: string;
  x: number;
  y: number;
};

type PanViewportProps = {
  src: string;
  viewScale: number;
  panEnabled: boolean;
  acquireEnabled: boolean;
  activeTarget: PanTarget | null;
  focusTarget: PanTarget | null;
  animateMotion?: boolean;
  motionMs?: number;
  acquireRadius?: number;
  hintKey?: number;
  onAcquire: (id: string) => void;
  onProximity?: (near: boolean) => void;
  children?: ReactNode;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function panLimits(lens: number, scale: number) {
  const imgW = lens * scale * SCENE_ASPECT;
  const imgH = lens * scale;
  return {
    maxX: Math.max(0, (imgW - lens) / 2),
    maxY: Math.max(0, (imgH - lens) / 2),
  };
}

function clampPan(pan: { x: number; y: number }, lens: number, scale: number) {
  const { maxX, maxY } = panLimits(lens, scale);
  return { x: clamp(pan.x, -maxX, maxX), y: clamp(pan.y, -maxY, maxY) };
}

/** Pan that places the scene target as close as possible to the lens center. */
function focusPanFor(lens: number, scale: number, target: PanTarget) {
  const ox = (target.x / 100 - 0.5) * lens * SCENE_ASPECT;
  const oy = (target.y / 100 - 0.5) * lens;
  return clampPan({ x: -ox * scale, y: -oy * scale }, lens, scale);
}

/** Circular lens pan/search. Dialogue stays in the parent scene. */
export function TelescopePanViewport({
  src,
  viewScale,
  panEnabled,
  acquireEnabled,
  activeTarget,
  focusTarget,
  animateMotion = false,
  motionMs = 600,
  acquireRadius = 0.26,
  hintKey = 0,
  onAcquire,
  onProximity,
  children,
}: PanViewportProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const preFocusRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; panX: number; panY: number } | null>(null);
  const acquiredRef = useRef(new Set<string>());
  const [lens, setLens] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [grabbing, setGrabbing] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const sync = () => {
      const r = el.getBoundingClientRect();
      setLens(Math.min(r.width, r.height));
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const baseW = lens * SCENE_ASPECT;
  const baseH = lens;

  useEffect(() => {
    if (lens < 1) return;
    if (focusTarget) {
      if (!preFocusRef.current) {
        preFocusRef.current = { ...panRef.current };
      }
      const dest = focusPanFor(lens, viewScale, focusTarget);
      panRef.current = dest;
      setPan(dest);
      return;
    }
    if (preFocusRef.current) {
      const dest = clampPan(preFocusRef.current, lens, viewScale);
      preFocusRef.current = null;
      panRef.current = dest;
      setPan(dest);
    } else {
      const dest = clampPan(panRef.current, lens, viewScale);
      panRef.current = dest;
      setPan(dest);
    }
  }, [focusTarget, viewScale, lens]);

  useEffect(() => {
    if (panEnabled) return;
    dragRef.current = null;
    setGrabbing(false);
  }, [panEnabled]);

  const targetInLens = useCallback(
    (target: PanTarget) => {
      if (lens < 1) return null;
      const ox = (target.x / 100 - 0.5) * baseW;
      const oy = (target.y / 100 - 0.5) * baseH;
      const dx = ox * viewScale + panRef.current.x;
      const dy = oy * viewScale + panRef.current.y;
      return { dx, dy };
    },
    [baseH, baseW, lens, viewScale],
  );

  const evaluate = useCallback(() => {
    const target = activeTarget;
    if (!target || lens < 1) {
      setNear(false);
      onProximity?.(false);
      return;
    }
    const pos = targetInLens(target);
    if (!pos) return;
    const dist = Math.hypot(pos.dx, pos.dy);
    const radius = acquireRadius * lens;
    const isNear = dist <= radius * 1.35;
    setNear(isNear);
    onProximity?.(isNear);
    if (!acquireEnabled || acquiredRef.current.has(target.id)) return;
    if (dist <= radius) {
      acquiredRef.current.add(target.id);
      onAcquire(target.id);
    }
  }, [acquireEnabled, acquireRadius, activeTarget, lens, onAcquire, onProximity, targetInLens]);

  useEffect(() => {
    evaluate();
  }, [evaluate, pan, activeTarget, acquireEnabled, lens, viewScale]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panEnabled || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
    setGrabbing(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId || !panEnabled) return;
    const next = clampPan(
      { x: drag.panX + (event.clientX - drag.x), y: drag.panY + (event.clientY - drag.y) },
      lens,
      viewScale,
    );
    panRef.current = next;
    setPan(next);
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id !== event.pointerId) return;
    dragRef.current = null;
    setGrabbing(false);
  };

  const hintPos = activeTarget && lens > 1 ? targetInLens(activeTarget) : null;
  const hintDist = hintPos ? Math.hypot(hintPos.dx, hintPos.dy) : 0;
  const hintStar =
    hintPos && hintDist > acquireRadius * lens
      ? {
          x: 50 + (hintPos.dx / hintDist) * 42,
          y: 50 + (hintPos.dy / hintDist) * 42,
        }
      : null;

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      aria-label="观测视野"
      className={`telescope-pan ${grabbing ? "is-grabbing" : ""} ${panEnabled ? "is-live" : "is-locked"}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className={`telescope-pan-scene ${animateMotion ? "is-animating" : ""}`}
        style={{
          width: lens ? baseW : "150%",
          height: lens ? baseH : "100%",
          transform: `translate(-50%, -50%) translate3d(${pan.x}px, ${pan.y}px, 0) scale(${viewScale})`,
          transition: animateMotion
            ? `transform ${motionMs}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
            : "none",
        }}
      >
        <img src={src} alt="" width={1536} height={1024} draggable={false} />
        {activeTarget && (
          <span
            key={hintKey}
            className={`telescope-pan-target-glow ${hintKey > 0 ? "is-hint" : ""}`}
            style={{ left: `${activeTarget.x}%`, top: `${activeTarget.y}%` }}
          />
        )}
        {children}
      </div>

      <div className={`telescope-reticle ${near ? "is-near" : ""}`} aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>

      {hintKey > 0 && hintStar && (
        <span
          key={`star-${hintKey}`}
          className="telescope-pan-hint-star"
          style={{ left: `${hintStar.x}%`, top: `${hintStar.y}%` }}
        />
      )}
    </div>
  );
}
