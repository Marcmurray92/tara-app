import { Button } from "@/components/ui/button";

export function CrosswordStatusDialog({
  open,
  title,
  description,
  actionLabel,
  onClose
}: {
  open: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crossword-status-title"
        className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-surface-strong p-6 shadow-glow"
      >
        <h2 id="crossword-status-title" className="font-display text-3xl text-text">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
        <Button className="mt-6 w-full" onClick={onClose}>
          {actionLabel ?? "Okay"}
        </Button>
      </div>
    </div>
  );
}
