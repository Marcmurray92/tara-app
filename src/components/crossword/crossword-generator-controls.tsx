import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CrosswordGeneratorControls({
  seed,
  onSeedChange,
  onGenerate
}: {
  seed: string;
  onSeedChange: (value: string) => void;
  onGenerate: () => void;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-surface/90 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Label htmlFor="seed">Generation seed</Label>
          <Input id="seed" value={seed} onChange={(event) => onSeedChange(event.target.value)} />
        </div>
        <Button onClick={onGenerate}>Generate crossword</Button>
      </div>
    </div>
  );
}

