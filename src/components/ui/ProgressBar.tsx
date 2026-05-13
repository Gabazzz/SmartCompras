interface Props {
  percent: number; // 0-100
  height?: number;
  showGlow?: boolean;
}

export default function ProgressBar({ percent, height = 5, showGlow = true }: Props) {
  const clamped = Math.min(Math.max(percent, 0), 100);

  const colorClass =
    clamped >= 100 ? 'red' :
    clamped >= 80  ? 'yellow' : 'green';

  return (
    <div
      className="progress-track"
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`progress-fill ${colorClass}`}
        style={{
          width: `${clamped}%`,
          boxShadow: showGlow
            ? colorClass === 'green'
              ? '0 0 10px rgba(0, 255, 157, 0.7)'
              : colorClass === 'yellow'
              ? '0 0 10px rgba(255, 184, 0, 0.7)'
              : '0 0 10px rgba(255, 77, 109, 0.7)'
            : undefined,
        }}
      />
    </div>
  );
}
