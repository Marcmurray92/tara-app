import { describe, expect, it } from "vitest";

import {
  buildCrosswordAuthoringInitialData,
  buildSavedCompilation,
  createImportResultFromEnvelope
} from "@/features/crossword/admin/crossword-authoring-state";
import type { GameContentRecord } from "@/features/content/content.types";
import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import { createCrosswordSourceDataEnvelope, normalizeCrosswordSourceData } from "@/features/crossword/source/crossword-source-data";
import type { CrosswordSourceRow } from "@/features/crossword/source/crossword-source.types";

const sourceRows: CrosswordSourceRow[] = [
  {
    id: "row-1",
    sourceRowNumber: 2,
    clue: "Greeting",
    answer: "Hello",
    gridAnswer: "HELLO",
    status: "complete",
    issues: []
  },
  {
    id: "row-2",
    sourceRowNumber: 3,
    clue: "Metal",
    answer: "Gold",
    gridAnswer: "GOLD",
    status: "complete",
    issues: []
  },
  {
    id: "row-3",
    sourceRowNumber: 4,
    clue: "Draft",
    answer: "",
    status: "incomplete",
    issues: []
  }
];

const compiledData: CrosswordCompiledData = {
  schemaVersion: 1,
  rows: 1,
  columns: 5,
  cells: [
    [
      { row: 0, column: 0, solution: "H", acrossEntryId: "row-1", number: 1 },
      { row: 0, column: 1, solution: "E", acrossEntryId: "row-1" },
      { row: 0, column: 2, solution: "L", acrossEntryId: "row-1" },
      { row: 0, column: 3, solution: "L", acrossEntryId: "row-1" },
      { row: 0, column: 4, solution: "O", acrossEntryId: "row-1" }
    ]
  ],
  entries: [
    {
      id: "row-1",
      sourceRowNumber: 2,
      number: 1,
      direction: "across",
      clue: "Greeting",
      answer: "HELLO",
      displayAnswer: "Hello",
      startRow: 0,
      startColumn: 0,
      length: 5
    }
  ],
  generation: {
    seed: "saved-seed",
    attemptedEntryIds: ["row-1", "row-2"],
    placedEntryIds: ["row-1"],
    unplacedEntryIds: ["row-2"],
    generatedAt: "2026-06-24T00:00:00.000Z",
    algorithmVersion: 1
  },
  completion: {
    title: "Done",
    message: "Finished"
  }
};

describe("crossword authoring state helpers", () => {
  it("reconstructs import preview metadata from saved source rows", () => {
    const importResult = createImportResultFromEnvelope(
      createCrosswordSourceDataEnvelope({
        rows: sourceRows,
        authoring: {
          selectedRowIds: ["row-1"],
          seed: "seed-123",
          completion: {
            title: "Nice",
            message: "Well done"
          },
          importMetadata: {
            detectedHeaders: ["Clue", "Answer", "Category"],
            unknownHeaders: ["Notes"],
            ignoredBlankRows: 2
          }
        }
      })
    );

    expect(importResult.rows).toHaveLength(3);
    expect(importResult.detectedHeaders).toEqual(["Clue", "Answer", "Category"]);
    expect(importResult.unknownHeaders).toEqual(["Notes"]);
    expect(importResult.ignoredBlankRows).toBe(2);
    expect(importResult.issues).toEqual([]);
  });

  it("reconstructs placed and unplaced rows from saved compiled data", () => {
    const compilation = buildSavedCompilation(sourceRows, compiledData);

    expect(compilation?.placedRows.map((row) => row.id)).toEqual(["row-1"]);
    expect(compilation?.unplacedRows.map((row) => row.id)).toEqual(["row-2"]);
  });

  it("builds initial editor state from a saved crossword record", () => {
    const record: GameContentRecord = {
      id: "content-1",
      gameType: "crossword",
      slug: "hello-gold",
      title: "Hello Gold",
      subtitle: "Saved puzzle",
      description: "A saved crossword",
      status: "published",
      sourceSchemaVersion: 1,
      compiledSchemaVersion: 1,
      contentVersion: 3,
      sourceData: createCrosswordSourceDataEnvelope({
        rows: sourceRows,
        authoring: {
          selectedRowIds: ["row-2"],
          seed: "saved-seed-from-source",
          completion: {
            title: "Saved source title",
            message: "Saved source message"
          },
          importMetadata: {
            detectedHeaders: ["Clue", "Answer", "Category"],
            unknownHeaders: [],
            ignoredBlankRows: 1
          }
        }
      }),
      compiledData,
      createdAt: "2026-06-24T00:00:00.000Z",
      updatedAt: "2026-06-24T00:00:00.000Z",
      publishedAt: "2026-06-24T00:00:00.000Z"
    };

    const state = buildCrosswordAuthoringInitialData(record);

    expect(state.contentId).toBe("content-1");
    expect(state.seed).toBe("saved-seed-from-source");
    expect(state.selectedRowIds).toEqual(["row-2"]);
    expect(state.completionTitle).toBe("Saved source title");
    expect(state.compilation?.compiledData?.completion.title).toBe("Done");
  });

  it("normalizes legacy saved row arrays into the new source-data envelope", () => {
    const normalized = normalizeCrosswordSourceData(sourceRows);

    expect(normalized.schemaVersion).toBe(1);
    expect(normalized.rows).toHaveLength(3);
    expect(normalized.authoring?.selectedRowIds).toEqual(["row-1", "row-2"]);
    expect(normalized.authoring?.seed).toBe("tara-admin-seed");
  });
});
