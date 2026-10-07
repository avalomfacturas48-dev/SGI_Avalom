"use client";

interface QuickPicksProps {
  options: string[];
  onPick: (value: string) => void;
  disabled?: boolean;
}

// Botones tipo "chip" para rellenar un campo con un valor frecuente
export function QuickPicks({ options, onPick, disabled = false }: QuickPicksProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          disabled={disabled}
          className="text-[11px] px-2 py-0.5 rounded-full border bg-muted/50 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {v}
        </button>
      ))}
    </div>
  );
}
