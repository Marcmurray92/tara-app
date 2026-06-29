import { describe, expect, it } from "vitest";

import { parseConnectionsSource } from "@/features/connections/source/connections-source.parser";
import { parseCrosswordSource } from "@/features/crossword/source/crossword-source.parser";
import { parseGuessingSource } from "@/features/guessing/source/guessing-source.parser";

describe("tabular parsers", () => {
  it("parses crossword CSV with BOM, quoted commas, and incomplete rows", () => {
    const result = parseCrosswordSource(`\uFEFFClue,Answer,Category\n"Hello, Tara",Happy Birthday,Party\nMissing answer,,Party\n`);

    expect(result.detectedHeaders).toEqual(["Clue", "Answer", "Category"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toMatchObject({
      sourceRowNumber: 2,
      status: "complete",
      clue: "Hello, Tara",
      answer: "Happy Birthday",
      gridAnswer: "HAPPYBIRTHDAY"
    });
    expect(result.rows[1]).toMatchObject({
      sourceRowNumber: 3,
      status: "incomplete"
    });
  });

  it("parses TSV guessing rows with multiline review text", () => {
    const result = parseGuessingSource(
      `Right Answer\tAnswer 2\tAnswer 3\tAnswer 4\tLetterboxed Reviews\nArrival\tInterstellar\tGravity\tContact\t"line one\nline two"\n`
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      status: "complete",
      rightAnswer: "Arrival",
      letterboxdReviews: "line one\nline two"
    });
  });

  it("retains unknown headers and ignores blank rows", () => {
    const result = parseCrosswordSource(`Clue,Answer,Category,Notes\nFirst clue,Cake,Party,Keep\n,,,`);

    expect(result.unknownHeaders).toEqual(["Notes"]);
    expect(result.ignoredBlankRows).toBe(1);
    expect(result.rows).toHaveLength(1);
  });

  it("parses crossword CSV without a category column", () => {
    const result = parseCrosswordSource(`Clue,Answer\nTiny clue,Tara\n`);

    expect(result.issues.some((issue) => issue.message.includes("Missing required heading"))).toBe(false);
    expect(result.rows[0]).toMatchObject({
      sourceRowNumber: 2,
      status: "complete",
      clue: "Tiny clue",
      answer: "Tara",
      category: undefined,
      gridAnswer: "TARA"
    });
  });

  it("keeps incomplete connections rows and rejects duplicate titles within a row", () => {
    const result = parseConnectionsSource(
      `Category,Movie 1,Movie 2,Movie 3,Movie 4\nTime loops,Groundhog Day,Groundhog Day,Palm Springs,Arrival\nDraft row,Only one,,,`
    );

    expect(result.rows[0].status).toBe("invalid");
    expect(result.rows[1].status).toBe("incomplete");
  });

  it("requires the exact Letterboxed Reviews heading", () => {
    const result = parseGuessingSource(
      `Right Answer,Answer 2,Answer 3,Answer 4,Letterboxd Reviews\nArrival,Interstellar,Gravity,Contact,review`
    );

    expect(result.issues.some((issue) => issue.message.includes('Missing required heading "Letterboxed Reviews".'))).toBe(
      true
    );
  });
});
