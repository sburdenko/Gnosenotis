"use client";

interface ProgressBarProps {
  label: string;
  count: number;
  total: number;
  onReset: () => void;
}

export function ProgressBar({ label, count, total, onReset }: ProgressBarProps) {
  const percent = total ? (count / total) * 100 : 0;

  return (
    <div className="mt-3.5 flex items-center gap-2.5 text-[12.5px] text-muted">
      <span>
        {count} / {total} {label}
      </span>
      <span className="h-[5px] max-w-65 flex-1 overflow-hidden rounded-full bg-panel">
        <span className="block h-full bg-ok transition-[width]" style={{ width: `${percent}%` }} />
      </span>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-line bg-panel px-3 py-1.5 text-[12.5px] whitespace-nowrap text-muted hover:border-[#3a4655] hover:text-txt"
      >
        Reset
      </button>
    </div>
  );
}
