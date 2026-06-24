import { Eraser, Eye, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CrosswordToolbar({
  onCheckLetter,
  onCheckWord,
  onCheckPuzzle,
  onRevealLetter,
  onRevealWord,
  onRevealPuzzle,
  onClearWord,
  onClearPuzzle,
  onResetProgress
}: {
  onCheckLetter: () => void;
  onCheckWord: () => void;
  onCheckPuzzle: () => void;
  onRevealLetter: () => void;
  onRevealWord: () => void;
  onRevealPuzzle: () => void;
  onClearWord: () => void;
  onClearPuzzle: () => void;
  onResetProgress: () => void;
}) {
  const sections = (
    <>
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted">
          <ShieldCheck className="h-4 w-4" />
          Check
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onCheckLetter}>Letter</Button>
          <Button variant="secondary" size="sm" onClick={onCheckWord}>Word</Button>
          <Button variant="secondary" size="sm" onClick={onCheckPuzzle}>Puzzle</Button>
        </div>
      </div>
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted">
          <Eye className="h-4 w-4" />
          Reveal
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onRevealLetter}>Letter</Button>
          <Button variant="outline" size="sm" onClick={onRevealWord}>Word</Button>
          <Button variant="outline" size="sm" onClick={onRevealPuzzle}>Puzzle</Button>
        </div>
      </div>
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted">
          <Eraser className="h-4 w-4" />
          Clear
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={onClearWord}>Current word</Button>
          <Button variant="ghost" size="sm" onClick={onClearPuzzle}>Puzzle</Button>
          <Button variant="ghost" size="sm" onClick={onResetProgress}>Reset</Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="hidden rounded-[1.25rem] border border-white/10 bg-surface/90 p-4 lg:block">
      <div className="grid gap-3 lg:grid-cols-3">{sections}</div>
    </div>
  );
}
