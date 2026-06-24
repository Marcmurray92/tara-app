import type { GameContentRecord } from "@/features/content/content.types";
import type { ImportResult } from "@/features/content/import.types";
import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import type { CrosswordCompilationResult } from "@/features/crossword/generator/crossword-generator.types";
import { normalizeCrosswordSourceData } from "@/features/crossword/source/crossword-source-data";
import type {
  CrosswordCompleteSourceRow,
  CrosswordSourceDataEnvelope,
  CrosswordSourceRow
} from "@/features/crossword/source/crossword-source.types";

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

export function createImportResultFromEnvelope(sourceData: CrosswordSourceDataEnvelope): ImportResult<CrosswordSourceRow> {
  return {
    rows: sourceData.rows,
    ignoredBlankRows: sourceData.authoring?.importMetadata?.ignoredBlankRows ?? 0,
    issues: sourceData.rows.flatMap((row) => row.issues),
    detectedHeaders: sourceData.authoring?.importMetadata?.detectedHeaders ?? ["Clue", "Answer", "Category"],
    unknownHeaders: sourceData.authoring?.importMetadata?.unknownHeaders ?? []
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
  const sourceData = normalizeCrosswordSourceData(record.sourceData);
  const sourceRows = sourceData.rows;
  const compiledData = record.compiledData as CrosswordCompiledData | undefined;
  const importResult = createImportResultFromEnvelope(sourceData);
  const authoredSelectedIds = sourceData.authoring?.selectedRowIds ?? [];
  const selectedRows =
    authoredSelectedIds.length > 0
      ? sourceRows.filter(
        (row): row is CrosswordCompleteSourceRow =>
            row.status === "complete" && authoredSelectedIds.includes(row.id)
        )
      : getSelectedCompleteRows(sourceRows, compiledData);

  return {
    contentId: record.id,
    title: record.title,
    slug: record.slug,
    subtitle: record.subtitle ?? "",
    description: record.description ?? "",
    completionTitle: sourceData.authoring?.completion.title ?? compiledData?.completion.title ?? "You did it",
    completionMessage:
      sourceData.authoring?.completion.message ?? compiledData?.completion.message ?? "",
    seed: sourceData.authoring?.seed ?? compiledData?.generation.seed ?? "tara-admin-seed",
    importResult,
    selectedRowIds: selectedRows.map((row) => row.id),
    compilation: buildSavedCompilation(sourceRows, compiledData),
    status: record.status
  };
}
