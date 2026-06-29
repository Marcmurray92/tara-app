import type { ImportIssue, ImportResult } from "@/features/content/import.types";
import { parseTabularData } from "@/features/content/parse-tabular-data";
import { normalizeGridAnswer } from "@/features/crossword/source/crossword-normalisation";
import type { CrosswordSourceRow } from "@/features/crossword/source/crossword-source.types";

const REQUIRED_HEADERS = ["Clue", "Answer"] as const;
const OPTIONAL_HEADERS = ["Category", "Grid Answer"] as const;

export function parseCrosswordSource(rawText: string): ImportResult<CrosswordSourceRow> {
  const table = parseTabularData({
    rawText,
    requiredHeaders: [...REQUIRED_HEADERS],
    optionalHeaders: [...OPTIONAL_HEADERS]
  });

  const rows = table.rows.map<CrosswordSourceRow>((row) => {
    const issues: ImportIssue[] = [];
    const clue = row.values["Clue"] ?? "";
    const answer = row.values["Answer"] ?? "";
    const category = row.values["Category"] || undefined;
    const explicitGridAnswer = row.values["Grid Answer"] || undefined;
    const candidateGridAnswer = explicitGridAnswer ?? answer;

    if (!clue) {
      issues.push({
        rowNumber: row.sourceRowNumber,
        column: "Clue",
        severity: "warning",
        code: "missing_clue",
        message: "This row is missing a clue and is being retained as incomplete draft content."
      });
    }

    if (!answer) {
      issues.push({
        rowNumber: row.sourceRowNumber,
        column: "Answer",
        severity: "warning",
        code: "missing_answer",
        message: "This row is missing an answer and is being retained as incomplete draft content."
      });
    }

    let gridAnswer: string | undefined;

    if (candidateGridAnswer) {
      const normalized = normalizeGridAnswer(candidateGridAnswer);
      if (normalized.ok) {
        gridAnswer = normalized.value;
      } else if (clue && answer) {
        issues.push({
          rowNumber: row.sourceRowNumber,
          column: explicitGridAnswer ? "Grid Answer" : "Answer",
          severity: "error",
          code: "invalid_grid_answer",
          message: normalized.reason
        });
      }
    }

    const hasError = issues.some((issue) => issue.severity === "error");
    const isComplete = Boolean(clue && answer && gridAnswer && !hasError);
    const status = hasError ? "invalid" : isComplete ? "complete" : "incomplete";

    return {
      id: `crossword-source-row-${row.sourceRowNumber}`,
      sourceRowNumber: row.sourceRowNumber,
      clue,
      answer,
      category,
      gridAnswer,
      status,
      issues
    };
  });

  return {
    rows,
    ignoredBlankRows: table.ignoredBlankRows,
    issues: [...table.issues, ...rows.flatMap((row) => row.issues)],
    detectedHeaders: table.detectedHeaders,
    unknownHeaders: table.unknownHeaders
  };
}
