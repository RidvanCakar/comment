"use client";

interface CountSelectorProps {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
  compact?: boolean;
}

export default function CountSelector({
  label,
  value,
  options,
  onChange,
  compact = false,
}: CountSelectorProps) {
  return (
    <div className={`flex flex-wrap items-center ${compact ? "gap-1.5" : "gap-2"}`}>
      {!compact && (
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </span>
      )}
      <div className="flex flex-wrap gap-1">
        {options.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              title={compact ? `${label}: ${option}` : undefined}
              className={`font-mono text-xs font-semibold transition-colors ${
                compact
                  ? `min-h-7 rounded-md px-2 ${
                      active
                        ? "bg-accent-record/15 text-accent-record"
                        : "text-text-muted hover:text-text-primary"
                    }`
                  : `min-h-9 rounded-lg border px-3 font-bold ${
                      active
                        ? "border-accent-record/50 bg-accent-record/15 text-accent-record"
                        : "border-border-subtle bg-bg-base/50 text-text-muted hover:border-accent-record/30 hover:text-text-primary"
                    }`
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
