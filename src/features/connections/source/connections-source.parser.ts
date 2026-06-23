import type { ImportIssue, ImportResult } from "@/features/content/import.types";
import { parseTabularData } from "@/features/content/parse-tabular-data";
import type { ConnectionsSourceRow } from "@/features/connections/source/connections-source.types";

const REQUIRED_HEADERS = ["Category", "Movie 1", "Movie 2", "Movie 3", "Movie 4"] as const;

function normalizeMovie(movie: string) {
  return movie.trim().toLowerCase();
}

export function parseConnectionsSource(rawText: string): ImportResult<ConnectionsSourceRow> {
  const table = parseTabularData({
    rawText,
    requiredHeaders: [...REQUIRED_HEADERS]
  });

  const rows = table.rows.map<ConnectionsSourceRow>((row) => {
    const issues: ImportIssue[] = [];
    const category = row.values["Category"] ?? "";
    const movies = [
      row.values["Movie 1"] ?? "",
      row.values["Movie 2"] ?? "",
      row.values["Movie 3"] ?? "",
      row.values["Movie 4"] ?? ""
    ];

    if (!category) {
      issues.push({
        rowNumber: row.sourceRowNumber,
        column: "Category",
        severity: "warning",
        code: "missing_category",
        message: "This row is missing a category and is being retained as incomplete draft content."
      });
    }

    const nonEmptyMovies = movies.filter(Boolean);

    if (nonEmptyMovies.length < 4) {
      issues.push({
        rowNumber: row.sourceRowNumber,
        severity: "warning",
        code: "incomplete_movies",
        message: "Connections rows need exactly four non-empty movie titles to become publishable."
      });
    }

    const duplicateTitles = new Set<string>();
    const seenTitles = new Set<string>();

    for (const movie of nonEmptyMovies.map(normalizeMovie)) {
      if (seenTitles.has(movie)) {
        duplicateTitles.add(movie);
      }
      seenTitles.add(movie);
    }

    if (duplicateTitles.size > 0) {
      issues.push({
        rowNumber: row.sourceRowNumber,
        severity: "error",
        code: "duplicate_movie_in_row",
        message: "A Connections row cannot contain the same movie title more than once."
      });
    }

    const hasError = issues.some((issue) => issue.severity === "error");
    const isComplete = Boolean(category) && nonEmptyMovies.length === 4 && !hasError;
    const status = hasError ? "invalid" : isComplete ? "complete" : "incomplete";

    return {
      id: `connections-source-row-${row.sourceRowNumber}`,
      sourceRowNumber: row.sourceRowNumber,
      category,
      movies,
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

