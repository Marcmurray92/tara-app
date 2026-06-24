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
    return <div className="aspect-square rounded-[0.2rem] bg-black/70 sm:rounded-[0.3rem]" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative aspect-square rounded-[0.28rem] border text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:rounded-[0.42rem]",
        highlighted ? "bg-active-entry/75" : "bg-surface-strong",
        selected ? "border-accent bg-accent-soft shadow-[inset_0_0_0_1px_rgba(231,200,96,0.9),0_0_0_1px_rgba(212,175,55,0.45)]" : "border-border",
        incorrect ? "text-error" : "text-text",
        revealed ? "bg-revealed/80" : ""
      )}
    >
      {number ? (
        <span className="absolute left-0.5 top-0.5 text-[0.45rem] leading-none text-muted sm:left-1 sm:top-1 sm:text-[0.55rem]">
          {number}
        </span>
      ) : null}
      <span className="text-[0.95rem] font-semibold sm:text-xl">{value}</span>
      {revealed ? (
        <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      ) : null}
    </button>
  );
}
