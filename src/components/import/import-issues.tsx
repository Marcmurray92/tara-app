import type { ImportIssue } from "@/features/content/import.types";

export function ImportIssues({ issues }: { issues: ImportIssue[] }) {
  if (issues.length === 0) {
    return (
      <div className="rounded-[1.2rem] border border-success/20 bg-success/10 p-4 text-sm text-text">
        No import issues detected.
      </div>
    );
  }

  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-surface/90 p-4">
      <h3 className="mb-3 text-sm uppercase tracking-[0.24em] text-muted">Import issues</h3>
      <ul className="space-y-3 text-sm leading-6">
        {issues.map((issue, index) => (
          <li key={`${issue.code}-${issue.rowNumber ?? "global"}-${index}`} className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={issue.severity === "error" ? "text-error" : "text-accent"}>
                {issue.severity.toUpperCase()}
              </span>
              {issue.rowNumber ? <span className="text-muted">Row {issue.rowNumber}</span> : null}
              {issue.column ? <span className="text-muted">Column {issue.column}</span> : null}
            </div>
            <p className="mt-2 text-text">{issue.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

