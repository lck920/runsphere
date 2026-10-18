export default function ProgressBar({ pct, label }: { pct: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 overflow-hidden rounded-full bg-track"
    >
      <div
        className={`h-full rounded-full bg-accent`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}
