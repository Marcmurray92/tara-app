import { describe, expect, it } from "vitest";

import { compileCrossword } from "@/features/crossword/generator/crossword-generator";
import type { CrosswordCompleteSourceRow } from "@/features/crossword/source/crossword-source.types";

const rows: CrosswordCompleteSourceRow[] = [
  {
    id: "1",
    sourceRowNumber: 2,
    clue: "Greeting",
    answer: "Hello",
    category: "Test",
    gridAnswer: "HELLO",
    status: "complete",
    issues: []
  },
  {
    id: "2",
    sourceRowNumber: 3,
    clue: "Golden metal",
    answer: "Gold",
    category: "Test",
    gridAnswer: "GOLD",
    status: "complete",
    issues: []
  },
  {
    id: "3",
    sourceRowNumber: 4,
    clue: "Shout",
    answer: "Yell",
    category: "Test",
    gridAnswer: "YELL",
    status: "complete",
    issues: []
  }
];

describe("crossword generator", () => {
  it("generates deterministic output for the same seed", () => {
    const first = compileCrossword({
      rows,
      seed: "seed-1",
      completion: {
        title: "Done",
        message: "Done"
      }
    });
    const second = compileCrossword({
      rows,
      seed: "seed-1",
      completion: {
        title: "Done",
        message: "Done"
      }
    });

    expect(first.compiledData).toBeTruthy();
    expect(second.compiledData?.cells).toEqual(first.compiledData?.cells);
    expect(second.compiledData?.entries).toEqual(first.compiledData?.entries);
    expect(second.compiledData?.generation.placedEntryIds).toEqual(first.compiledData?.generation.placedEntryIds);
    expect(second.compiledData?.generation.unplacedEntryIds).toEqual(first.compiledData?.generation.unplacedEntryIds);
  });

  it("rejects duplicate normalized answers in one crossword", () => {
    const result = compileCrossword({
      rows: [
        ...rows,
        {
          id: "4",
          sourceRowNumber: 5,
          clue: "Duplicate",
          answer: "He llo",
          category: "Test",
          gridAnswer: "HELLO",
          status: "complete",
          issues: []
        }
      ],
      seed: "seed-1",
      completion: {
        title: "Done",
        message: "Done"
      }
    });

    expect(result.compiledData).toBeNull();
    expect(result.issues.some((issue) => issue.code === "duplicate_grid_answer")).toBe(true);
  });
});
