import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function PasteDataDialog({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-surface/90 p-4">
      <Label htmlFor="source-data">Paste CSV or TSV copied from Google Sheets</Label>
      <Textarea
        id="source-data"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Clue\tAnswer\tCategory\nA placeholder clue\tHappy Birthday\tPlaceholder`}
      />
    </div>
  );
}

