import { Button } from "@/components/ui/button";

export function CrosswordConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-surface-strong p-6 shadow-glow"
      >
        <h2 className="font-display text-3xl">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

