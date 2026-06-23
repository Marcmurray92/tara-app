import type { ImportIssue, ImportResult } from "@/features/content/import.types";
import { parseTabularData } from "@/features/content/parse-tabular-data";
import type { GuessingSourceRow } from "@/features/guessing/source/guessing-source.types";

const REQUIRED_HEADERS = ["Right Answer", "Answer 2", "Answer 3", "Answer 4", "Letterboxed Reviews"] as const;

export function parseGuessingSource(rawText: string): ImportResult<GuessingSourceRow> {
  const table = parseTabularData({
    rawText,
    requiredHeaders: [...REQUIRED_HEADERS]
  });

  const rows = table.rows.map<GuessingSourceRow>((row) => {
    const issues: ImportIssue[] = [];
    const rightAnswer = row.values["Right Answer"] ?? "";
    const answer2 = row.values["Answer 2"] ?? "";
    const answer3 = row.values["Answer 3"] ?? "";
    const answer4 = row.values["Answer 4"] ?? "";
    const letterboxdReviews = row.values["Letterboxed Reviews"] ?? "";
    const choices = [rightAnswer, answer2, answer3, answer4].filter(Boolean);

    if (!letterboxdReviews) {
      issues.push({
        rowNumber: row.sourceRowNumber,
        column: "Letterboxed Reviews",
        severity: "warning",
        code: "missing_review",
        message: "This row is missing its review text and is being retained as incomplete draft content."
      });
    }

    if (choices.length < 4) {
      issues.push({
        rowNumber: row.sourceRowNumber,
        severity: "warning",
        code: "incomplete_choices",
        message: "Guessing rows need four non-empty answer choices to become publishable."
      });
    }

    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const choice of choices.map((choice) => choice.trim().toLowerCase())) {
      if (seen.has(choice)) {
        duplicates.add(choice);
      }
      seen.add(choice);
    }

    if (duplicates.size > 0) {
      issues.push({
        rowNumber: row.sourceRowNumber,
        severity: "error",
        code: "duplicate_choice_in_row",
        message: "Each guessing row must contain four unique answer choices."
      });
    }

    const hasError = issues.some((issue) => issue.severity === "error");
    const isComplete = Boolean(letterboxdReviews) && choices.length === 4 && !hasError;
    const status = hasError ? "invalid" : isComplete ? "complete" : "incomplete";

    return {
      id: `guessing-source-row-${row.sourceRowNumber}`,
      sourceRowNumber: row.sourceRowNumber,
      rightAnswer,
      answer2,
      answer3,
      answer4,
      letterboxdReviews,
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
