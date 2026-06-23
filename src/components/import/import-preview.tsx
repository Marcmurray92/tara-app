import type { RowIssueCarrier, RowStatus } from "@/features/content/import.types";
import { cn } from "@/lib/utils/cn";

const statusStyles: Record<RowStatus, string> = {
  complete: "text-success",
  incomplete: "text-accent",
  invalid: "text-error"
};

type PreviewRow = RowIssueCarrier & {
  id: string;
  sourceRowNumber: number;
  clue?: string;
  answer?: string;
  category?: string;
  gridAnswer?: string;
};

export function ImportPreview({
  rows,
  selectedRowIds,
  onToggleRow
}: {
  rows: PreviewRow[];
  selectedRowIds: Set<string>;
  onToggleRow: (rowId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-surface/90">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-black/20 text-muted">
            <tr>
              <th className="px-4 py-3">Use</th>
              <th className="px-4 py-3">Row</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Clue</th>
              <th className="px-4 py-3">Answer</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Grid Answer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-white/10 align-top">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRowIds.has(row.id)}
                    disabled={row.status !== "complete"}
                    onChange={() => onToggleRow(row.id)}
                    aria-label={`Select row ${row.sourceRowNumber}`}
                  />
                </td>
                <td className="px-4 py-3 text-muted">{row.sourceRowNumber}</td>
                <td className={cn("px-4 py-3 font-medium capitalize", statusStyles[row.status])}>{row.status}</td>
                <td className="max-w-sm px-4 py-3 text-text">{row.clue ?? ""}</td>
                <td className="px-4 py-3 text-text">{row.answer ?? ""}</td>
                <td className="px-4 py-3 text-muted">{row.category ?? ""}</td>
                <td className="px-4 py-3 text-muted">{row.gridAnswer ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

