import type { GameContentRecord } from "@/features/content/content.types";
import type { ImportResult } from "@/features/content/import.types";
import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import type { CrosswordCompilationResult } from "@/features/crossword/generator/crossword-generator.types";
import type { CrosswordCompleteSourceRow, CrosswordSourceRow } from "@/features/crossword/source/crossword-source.types";

const DEFAULT_HEADERS = ["Clue", "Answer", "Category"];

export type CrosswordAuthoringInitialData = {
  contentId?: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  completionTitle: string;
  completionMessage: string;
  seed: string;
  importResult: ImportResult<CrosswordSourceRow> | null;
  selectedRowIds: string[];
  compilation: CrosswordCompilationResult | null;
  status?: "draft" | "published" | "archived";
};

export function createImportResultFromSourceRows(rows: CrosswordSourceRow[]): ImportResult<CrosswordSourceRow> {
  return {
    rows,
    ignoredBlankRows: 0,
    issues: rows.flatMap((row) => row.issues),
    detectedHeaders: DEFAULT_HEADERS,
    unknownHeaders: []
  };
}

function getSelectedCompleteRows(
  rows: CrosswordSourceRow[],
  compiledData?: CrosswordCompiledData
): CrosswordCompleteSourceRow[] {
  const completeRows = rows.filter((row): row is CrosswordCompleteSourceRow => row.status === "complete");
  const attemptedIds = new Set(compiledData?.generation.attemptedEntryIds ?? []);

  if (attemptedIds.size === 0) {
    return completeRows;
  }

  return completeRows.filter((row) => attemptedIds.has(row.id));
}

export function buildSavedCompilation(
  rows: CrosswordSourceRow[],
  compiledData?: CrosswordCompiledData
): CrosswordCompilationResult | null {
  if (!compiledData) {
    return null;
  }

  const selectedRows = getSelectedCompleteRows(rows, compiledData);
  const placedIdSet = new Set(compiledData.generation.placedEntryIds);

  return {
    compiledData,
    issues: [],
    placedRows: selectedRows.filter((row) => placedIdSet.has(row.id)),
    unplacedRows: selectedRows
      .filter((row) => !placedIdSet.has(row.id))
      .map((row) => ({
        id: row.id,
        clue: row.clue,
        answer: row.answer,
        sourceRowNumber: row.sourceRowNumber,
        reason: "This entry was selected in the saved generation but was not placed."
      }))
  };
}

export function buildCrosswordAuthoringInitialData(record: GameContentRecord): CrosswordAuthoringInitialData {
  const sourceRows = record.sourceData as CrosswordSourceRow[];
  const compiledData = record.compiledData as CrosswordCompiledData | undefined;
  const importResult = createImportResultFromSourceRows(sourceRows);
  const selectedRows = getSelectedCompleteRows(sourceRows, compiledData);

  return {
    contentId: record.id,
    title: record.title,
    slug: record.slug,
    subtitle: record.subtitle ?? "",
    description: record.description ?? "",
    completionTitle: compiledData?.completion.title ?? "You did it",
    completionMessage: compiledData?.completion.message ?? "",
    seed: compiledData?.generation.seed ?? "tara-admin-seed",
    importResult,
    selectedRowIds: selectedRows.map((row) => row.id),
    compilation: buildSavedCompilation(sourceRows, compiledData),
    status: record.status
  };
}
