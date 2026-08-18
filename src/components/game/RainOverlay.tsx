export function RainOverlay({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="rain-layer pointer-events-none absolute inset-0 z-20"
      style={{ opacity }}
    />
  );
}
