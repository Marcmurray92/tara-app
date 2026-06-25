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
  density?: "regular" | "compact" | "dense";
  fillContainer?: boolean;
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
  density = "regular",
  fillContainer = false,
  onClick
}: CrosswordCellProps) {
  const numberClass =
    density === "dense"
      ? "left-0.5 top-0.5 text-[0.32rem] sm:left-0.5 sm:top-0.5 sm:text-[0.38rem]"
      : density === "compact"
        ? "left-0.5 top-0.5 text-[0.38rem] sm:left-0.5 sm:top-0.5 sm:text-[0.45rem]"
        : "left-0.5 top-0.5 text-[0.45rem] sm:left-1 sm:top-1 sm:text-[0.55rem]";
  const valueClass =
    density === "dense"
      ? "text-[0.58rem] font-semibold sm:text-[0.78rem]"
      : density === "compact"
        ? "text-[0.72rem] font-semibold sm:text-[0.9rem]"
        : "text-[0.95rem] font-semibold sm:text-xl";
  const blockRadiusClass = density === "dense" ? "rounded-[0.12rem] sm:rounded-[0.18rem]" : "rounded-[0.2rem] sm:rounded-[0.3rem]";
  const cellRadiusClass =
    density === "dense"
      ? "rounded-[0.16rem] sm:rounded-[0.24rem]"
      : density === "compact"
        ? "rounded-[0.2rem] sm:rounded-[0.3rem]"
        : "rounded-[0.28rem] sm:rounded-[0.42rem]";

  if (isBlock) {
    return (
      <div className={cn(fillContainer ? "h-full w-full" : "aspect-square", "bg-black/70", blockRadiusClass)} aria-hidden="true" />
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "relative border text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        fillContainer ? "h-full w-full" : "aspect-square",
        cellRadiusClass,
        highlighted ? "bg-active-entry/75" : "bg-surface-strong",
        selected ? "border-accent bg-accent-soft shadow-[inset_0_0_0_1px_rgba(231,200,96,0.9),0_0_0_1px_rgba(212,175,55,0.45)]" : "border-border",
        incorrect ? "text-error" : "text-text",
        revealed ? "bg-revealed/80" : ""
      )}
    >
      {number ? (
        <span className={cn("absolute leading-none text-muted", numberClass)}>
          {number}
        </span>
      ) : null}
      <span className={valueClass}>{value}</span>
      {revealed ? (
        <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
      ) : null}
    </button>
  );
}
