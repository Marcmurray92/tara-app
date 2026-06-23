import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TabularImport({
  onFileText,
  onParse
}: {
  onFileText: (text: string) => void;
  onParse: () => void;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-surface/90 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text transition hover:bg-white/5">
          <Upload className="h-4 w-4" />
          Upload CSV
          <input
            type="file"
            accept=".csv,.tsv,text/csv,text/tab-separated-values"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }

              const text = await file.text();
              onFileText(text);
            }}
          />
        </label>
        <Button onClick={onParse}>Parse preview</Button>
      </div>
    </div>
  );
}

