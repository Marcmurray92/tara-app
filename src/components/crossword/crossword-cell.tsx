import { cn } from "@/lib/utils/cn";

type CrosswordCellProps = {
  label: string;
  number?: number;
  value: string;
  selected: boolean;
  highlighted: boolean;
  incorrect: boolean;
  revealed: boolean;
  isBlock: boolean;
  onClick: () => void;
};

export function CrosswordCell({
  label,
  number,
  value,
  selected,
  highlighted,
  incorrect,
  revealed,
  isBlock,
  onClick
}: CrosswordCellProps) {
  if (isBlock) {
    return <div className="aspect-square rounded-[0.3rem] bg-black/70" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-[0.42rem] border text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        highlighted ? "bg-active-entry/75" : "bg-surface-strong",
        selected ? "border-accent bg-accent-soft shadow-[inset_0_0_0_1px_rgba(231,200,96,0.9),0_0_0_1px_rgba(212,175,55,0.45)]" : "border-border",
        incorrect ? "text-error" : "text-text",
        revealed ? "bg-revealed/80" : ""
      )}
    >
      {number ? (
        <span className="absolute left-1 top-1 text-[0.55rem] leading-none text-muted">{number}</span>
      ) : null}
      <span className="text-lg font-semibold sm:text-xl">{value}</span>
      {revealed ? (
        <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      ) : null}
    </button>
  );
}
