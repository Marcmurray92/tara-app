import fs from "node:fs";
import path from "node:path";

import { compileCrossword } from "@/features/crossword/generator/crossword-generator";
import { normalizeGridAnswer } from "@/features/crossword/source/crossword-normalisation";
import type { CrosswordCompleteSourceRow } from "@/features/crossword/source/crossword-source.types";
import { crosswordCompiledDataSchema } from "@/features/crossword/game/crossword-game.schema";
import { parseDelimitedTable } from "@/lib/csv/parse-csv";

type RawClueBankRow = {
  bankNumber: number;
  sourceRowNumber: number;
  answer: string;
  clue: string;
};

type PuzzleManifestRow = {
  slug: string;
  title: string;
  subtitle: null;
  selectedSourceRowNumbers: number[];
};

type CandidateRow = CrosswordCompleteSourceRow & {
  bankNumber: number;
  sourceAnswer: string;
};

type GenerationSkip = {
  sourceRowNumber: number;
  clue: string;
  answer: string;
  reason: string;
};

const REPO_ROOT = process.cwd();
const CLUE_BANK_OUTPUT = path.join(REPO_ROOT, "src/features/crossword/seed/tara-crossword-clue-bank.json");
const PUZZLE_MANIFEST_OUTPUT = path.join(REPO_ROOT, "src/features/crossword/seed/tara-crossword-puzzles.json");
const SEEDED_CONTENT_OUTPUT = path.join(REPO_ROOT, "src/features/crossword/seed/tara-crossword-seeded-content.json");
const DEFAULT_COMPLETION = {
  title: "Puzzle complete",
  message: "You finished this grid. There are more waiting when you want another round.",
  actionLabel: "More crosswords",
  actionHref: "/games/crossword"
} as const;
const LAYOUT = {
  minRows: 12,
  maxRows: 17,
  minColumns: 12,
  maxColumns: 17,
  targetRows: 15,
  targetColumns: 15
} as const;
const MIN_CLUE_COUNT = 30;
const MAX_CLUE_COUNT = 50;
const CONTENT_VERSION = 6;
const LEGACY_SLUGS = [
  "taras-birthday-crossword",
  "taras-birthday-crossword-2",
  "taras-birthday-crossword-3",
  "taras-birthday-crossword-4",
  "taras-birthday-crossword-5",
  "taras-birthday-crossword-6",
  "taras-birthday-crossword-7"
] as const;

function ordinalDay(day: number) {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${day}th`;
  }

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function formatPuzzleTitle(date: Date) {
  const month = date.toLocaleString("en-IE", { month: "long", timeZone: "UTC" });
  return `${month} ${ordinalDay(date.getUTCDate())}`;
}

function buildSlug(index: number) {
  if (index < LEGACY_SLUGS.length) {
    return LEGACY_SLUGS[index];
  }

  return `taras-birthday-crossword-${index + 1}`;
}

function hashSeed(seed: string) {
  let hash = 1779033703 ^ seed.length;
  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    const next = (hash ^= hash >>> 16) >>> 0;
    return next / 4294967296;
  };
}

function readCsvRows(csvPath: string) {
  const raw = fs.readFileSync(csvPath, "utf8");
  const parsed = parseDelimitedTable(raw);

  if (parsed.errors.length > 0) {
    const messages = parsed.errors.map((error) => `${error.row ?? "?"}: ${error.message}`).join("; ");
    throw new Error(`Failed to parse crossword CSV cleanly: ${messages}`);
  }

  const [headerRow = [], ...bodyRows] = parsed.rows;
  const normalizedHeaders = headerRow.map((value) => value.trim().toLowerCase());
  const clueIndex = normalizedHeaders.findIndex((value) => value === "clue");
  const answerIndex = normalizedHeaders.findIndex((value) => value === "answer");

  if (clueIndex === -1 || answerIndex === -1) {
    throw new Error("Crossword CSV must include clue and answer columns.");
  }

  return bodyRows
    .filter((row) => row.some((value) => value.trim().length > 0))
    .map((row, index) => {
      const clue = String(row[clueIndex] ?? "").trim();
      const answer = String(row[answerIndex] ?? "").trim();
      return {
        bankNumber: index + 1,
        sourceRowNumber: index + 2,
        clue,
        answer
      };
    });
}

function buildGenerationPool(rawRows: RawClueBankRow[]) {
  const candidates: CandidateRow[] = [];
  const skipped: GenerationSkip[] = [];
  const seenGridAnswers = new Map<string, CandidateRow>();

  for (const row of rawRows) {
    const normalized = normalizeGridAnswer(row.answer);

    if (!row.clue || !row.answer) {
      skipped.push({
        sourceRowNumber: row.sourceRowNumber,
        clue: row.clue,
        answer: row.answer,
        reason: "missing clue or answer"
      });
      continue;
    }

    if (!normalized.ok) {
      skipped.push({
        sourceRowNumber: row.sourceRowNumber,
        clue: row.clue,
        answer: row.answer,
        reason: normalized.reason
      });
      continue;
    }

    if (normalized.value.length < 3) {
      skipped.push({
        sourceRowNumber: row.sourceRowNumber,
        clue: row.clue,
        answer: row.answer,
        reason: "grid answer shorter than 3 characters"
      });
      continue;
    }

    if (seenGridAnswers.has(normalized.value)) {
      skipped.push({
        sourceRowNumber: row.sourceRowNumber,
        clue: row.clue,
        answer: row.answer,
        reason: `duplicate normalized answer kept earlier as ${normalized.value}`
      });
      continue;
    }

    const candidate: CandidateRow = {
      id: `crossword-source-row-${row.sourceRowNumber}`,
      bankNumber: row.bankNumber,
      sourceRowNumber: row.sourceRowNumber,
      clue: row.clue,
      answer: row.answer,
      sourceAnswer: row.answer,
      gridAnswer: normalized.value,
      status: "complete",
      issues: []
    };

    seenGridAnswers.set(normalized.value, candidate);
    candidates.push(candidate);
  }

  return {
    candidates,
    skipped
  };
}

function getLetterFrequency(rows: CandidateRow[]) {
  const frequency = new Map<string, number>();

  for (const row of rows) {
    for (const character of new Set(row.gridAnswer)) {
      frequency.set(character, (frequency.get(character) ?? 0) + 1);
    }
  }

  return frequency;
}

function buildFrequencySubset(rows: CandidateRow[], maxLength: number, take: number, offset: number) {
  const pool = rows.filter((row) => row.gridAnswer.length <= maxLength);
  const frequency = getLetterFrequency(pool);
  const scored = [...pool].sort((left, right) => {
    const leftScore = Array.from(new Set(left.gridAnswer)).reduce(
      (total, character) => total + (frequency.get(character) ?? 0),
      0
    );
    const rightScore = Array.from(new Set(right.gridAnswer)).reduce(
      (total, character) => total + (frequency.get(character) ?? 0),
      0
    );

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    if (right.gridAnswer.length !== left.gridAnswer.length) {
      return right.gridAnswer.length - left.gridAnswer.length;
    }

    return left.answer.localeCompare(right.answer, "en");
  });

  return scored.slice(offset, offset + take);
}

function buildRandomOverlapSubset(rows: CandidateRow[], maxLength: number, targetSize: number, seed: string) {
  const pool = rows.filter((row) => row.gridAnswer.length <= maxLength);
  const frequency = getLetterFrequency(pool);
  const random = hashSeed(seed);

  if (pool.length === 0) {
    return [];
  }

  const anchorCandidates = [...pool].sort((left, right) => {
    const leftScore = Array.from(new Set(left.gridAnswer)).reduce(
      (total, character) => total + (frequency.get(character) ?? 0),
      0
    );
    const rightScore = Array.from(new Set(right.gridAnswer)).reduce(
      (total, character) => total + (frequency.get(character) ?? 0),
      0
    );

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return right.gridAnswer.length - left.gridAnswer.length;
  });

  const anchor = anchorCandidates[Math.floor(random() * Math.min(24, anchorCandidates.length))] ?? anchorCandidates[0];
  const selected = [anchor];
  const usedIds = new Set([anchor.id]);
  const activeLetters = new Map<string, number>();

  for (const character of anchor.gridAnswer) {
    activeLetters.set(character, (activeLetters.get(character) ?? 0) + 1);
  }

  while (selected.length < targetSize && usedIds.size < pool.length) {
    const scored = pool
      .filter((row) => !usedIds.has(row.id))
      .map((row) => {
        let overlap = 0;
        let uniqueOverlap = 0;
        const seen = new Set<string>();

        for (const character of row.gridAnswer) {
          if (activeLetters.has(character)) {
            overlap += 1;
            if (!seen.has(character)) {
              uniqueOverlap += 1;
              seen.add(character);
            }
          }
        }

        const frequencyScore = Array.from(new Set(row.gridAnswer)).reduce(
          (total, character) => total + (frequency.get(character) ?? 0),
          0
        );

        const lengthBonus = row.gridAnswer.length <= 5 ? 2 : row.gridAnswer.length <= 7 ? 1 : 0;

        return {
          row,
          score: uniqueOverlap * 9 + overlap * 1.6 + frequencyScore * 0.05 + lengthBonus + random() * 3
        };
      })
      .sort((left, right) => right.score - left.score);

    const top = scored.slice(0, Math.min(10, scored.length));
    const choice = top[Math.floor(random() * top.length)]?.row ?? scored[0]?.row;

    if (!choice) {
      break;
    }

    selected.push(choice);
    usedIds.add(choice.id);
    for (const character of choice.gridAnswer) {
      activeLetters.set(character, (activeLetters.get(character) ?? 0) + 1);
    }
  }

  return selected;
}

function evaluateSubset(rows: CandidateRow[], seed: string) {
  if (rows.length === 0) {
    return null;
  }

  const result = compileCrossword({
    rows,
    seed,
    completion: DEFAULT_COMPLETION,
    layout: LAYOUT
  });

  if (!result.compiledData) {
    return null;
  }

  if (result.placedRows.length < MIN_CLUE_COUNT || result.placedRows.length > MAX_CLUE_COUNT) {
    return null;
  }

  const finalizedRows = result.placedRows as CandidateRow[];
  const { rows: gridRows, columns: gridColumns } = result.compiledData;
  if (
    gridRows < LAYOUT.minRows ||
    gridRows > LAYOUT.maxRows ||
    gridColumns < LAYOUT.minColumns ||
    gridColumns > LAYOUT.maxColumns
  ) {
    return null;
  }

  const score =
    result.placedRows.length * 100 -
    Math.abs(result.compiledData.rows - (LAYOUT.targetRows ?? 15)) * 8 -
    Math.abs(result.compiledData.columns - (LAYOUT.targetColumns ?? 15)) * 8 -
    Math.abs(result.compiledData.rows - result.compiledData.columns) * 4 -
    Math.abs(result.placedRows.length - 36) * 3;

  return {
    seed,
    score,
    compiledData: result.compiledData,
    placedRows: finalizedRows
  };
}

function buildManifest(puzzles: Array<NonNullable<ReturnType<typeof evaluateSubset>>>) {
  const startDate = new Date(Date.UTC(2026, 5, 30));

  return puzzles.map<PuzzleManifestRow>((puzzle, index) => {
    if (!puzzle) {
      throw new Error("Encountered a null puzzle while building the crossword manifest.");
    }

    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + index);

    return {
      slug: buildSlug(index),
      title: formatPuzzleTitle(date),
      subtitle: null,
      selectedSourceRowNumbers: puzzle.placedRows.map((row) => row.sourceRowNumber)
    };
  });
}

function buildSourceData(rows: CandidateRow[], seed: string) {
  return {
    schemaVersion: 1 as const,
    rows: rows.map((row) => ({
      id: row.id,
      sourceRowNumber: row.sourceRowNumber,
      clue: row.clue,
      answer: row.answer,
      gridAnswer: row.gridAnswer,
      status: "complete" as const,
      issues: []
    })),
    authoring: {
      selectedRowIds: rows.map((row) => row.id),
      seed,
      completion: DEFAULT_COMPLETION,
      importMetadata: {
        detectedHeaders: ["clue", "answer"],
        unknownHeaders: [],
        ignoredBlankRows: 0
      }
    }
  };
}

function sanitizeCompiledData(
  compiledData: NonNullable<ReturnType<typeof evaluateSubset>>["compiledData"],
  placedRows: CandidateRow[],
  seed: string
) {
  const placedEntryIds = placedRows.map((row) => row.id);
  const sanitized = {
    ...compiledData,
    generation: {
      ...compiledData.generation,
      seed,
      attemptedEntryIds: placedEntryIds,
      placedEntryIds,
      unplacedEntryIds: [],
      generatedAt: new Date().toISOString()
    }
  };

  return crosswordCompiledDataSchema.parse(sanitized);
}

function buildSeededContent(
  manifest: PuzzleManifestRow[],
  puzzles: Array<NonNullable<ReturnType<typeof evaluateSubset>>>
) {
  return manifest.map((row, index) => {
    const puzzle = puzzles[index];
    const sanitizedCompiledData = sanitizeCompiledData(puzzle.compiledData, puzzle.placedRows, puzzle.seed);

    return {
      slug: row.slug,
      href: `/games/crossword/${row.slug}`,
      title: row.title,
      subtitle: row.subtitle,
      description: `${sanitizedCompiledData.rows}x${sanitizedCompiledData.columns} grid with ${puzzle.placedRows.length} clues.`,
      contentVersion: CONTENT_VERSION,
      clueCount: puzzle.placedRows.length,
      sourceRows: puzzle.placedRows.map((placedRow) => ({
        id: placedRow.id,
        sourceRowNumber: placedRow.sourceRowNumber,
        clue: placedRow.clue,
        answer: placedRow.answer,
        gridAnswer: placedRow.gridAnswer,
        status: "complete" as const,
        issues: []
      })),
      sourceData: buildSourceData(puzzle.placedRows, puzzle.seed),
      compiledData: sanitizedCompiledData
    };
  });
}

function findBestFrequencyPuzzle(remainingRows: CandidateRow[], puzzleIndex: number, maxLength: number) {
  let best: ReturnType<typeof evaluateSubset> = null;

  for (const take of [42, 44, 46, 48, 50, 52, 54, 56]) {
    const subset = buildFrequencySubset(remainingRows, maxLength, take, 0);
    const evaluated = evaluateSubset(subset, `freq:${puzzleIndex}:${maxLength}:${take}`);

    if (!evaluated) {
      continue;
    }

    const score = evaluated.placedRows.length * 10 - (take - evaluated.placedRows.length);
    if (!best || score > best.score) {
      best = {
        ...evaluated,
        score
      };
    }
  }

  return best;
}

function findBestRandomPuzzle(remainingRows: CandidateRow[], puzzleIndex: number, maxLength: number, attempts: number) {
  let best: ReturnType<typeof evaluateSubset> = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const subset = buildRandomOverlapSubset(
      remainingRows,
      maxLength,
      Math.min(50, remainingRows.filter((row) => row.gridAnswer.length <= maxLength).length),
      `random:${puzzleIndex}:${maxLength}:${attempt}`
    );
    const evaluated = evaluateSubset(subset, `random:${puzzleIndex}:${maxLength}:${attempt}`);

    if (!evaluated) {
      continue;
    }

    const score = evaluated.placedRows.length * 10 - (subset.length - evaluated.placedRows.length);
    if (!best || score > best.score) {
      best = {
        ...evaluated,
        score
      };
    }
  }

  return best;
}

function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    throw new Error("Usage: node --import tsx scripts/regenerate-crossword-seeds.ts /absolute/path/to/clues.csv");
  }

  const rawRows = readCsvRows(csvPath);
  const { candidates, skipped } = buildGenerationPool(rawRows);
  const remainingRows = [...candidates];
  const acceptedPuzzles: Array<NonNullable<ReturnType<typeof evaluateSubset>>> = [];

  while (true) {
    const nextPuzzle =
      findBestFrequencyPuzzle(remainingRows, acceptedPuzzles.length, 6) ??
      findBestRandomPuzzle(remainingRows, acceptedPuzzles.length, 7, 120) ??
      findBestFrequencyPuzzle(remainingRows, acceptedPuzzles.length, 7) ??
      findBestRandomPuzzle(remainingRows, acceptedPuzzles.length, 8, 140);

    if (!nextPuzzle) {
      break;
    }

    acceptedPuzzles.push(nextPuzzle);
    const usedIds = new Set(nextPuzzle.placedRows.map((row) => row.id));

    for (let index = remainingRows.length - 1; index >= 0; index -= 1) {
      if (usedIds.has(remainingRows[index].id)) {
        remainingRows.splice(index, 1);
      }
    }
  }

  if (acceptedPuzzles.length === 0) {
    throw new Error("No valid crosswords could be generated from the provided clue bank.");
  }

  const manifest = buildManifest(acceptedPuzzles);
  const seededContent = buildSeededContent(manifest, acceptedPuzzles);
  fs.writeFileSync(CLUE_BANK_OUTPUT, `${JSON.stringify(rawRows, null, 2)}\n`, "utf8");
  fs.writeFileSync(PUZZLE_MANIFEST_OUTPUT, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  fs.writeFileSync(SEEDED_CONTENT_OUTPUT, `${JSON.stringify(seededContent, null, 2)}\n`, "utf8");

  const usedSourceRowNumbers = new Set(
    acceptedPuzzles.flatMap((puzzle) => puzzle.placedRows.map((row) => row.sourceRowNumber))
  );
  const unusedRows = rawRows
    .filter((row) => !usedSourceRowNumbers.has(row.sourceRowNumber))
    .map((row) => {
      const alreadySkipped = skipped.find((item) => item.sourceRowNumber === row.sourceRowNumber);
      return (
        alreadySkipped ?? {
          sourceRowNumber: row.sourceRowNumber,
          clue: row.clue,
          answer: row.answer,
          reason: "not selected for a valid 12x12 to 17x17 puzzle"
        }
      );
    });

  console.log(
    JSON.stringify(
      {
        puzzlesGenerated: manifest.length,
        puzzles: acceptedPuzzles.map((puzzle, index) => ({
          slug: manifest[index].slug,
          title: manifest[index].title,
          gridSize: `${puzzle.compiledData.rows}x${puzzle.compiledData.columns}`,
          clueCount: puzzle.placedRows.length,
          sourceRowNumbers: manifest[index].selectedSourceRowNumbers
        })),
        skippedCount: unusedRows.length,
        skippedRows: unusedRows
      },
      null,
      2
    )
  );
}

main();
