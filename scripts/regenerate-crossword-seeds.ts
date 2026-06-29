import fs from "node:fs";
import path from "node:path";

import { crosswordCompiledDataSchema } from "@/features/crossword/game/crossword-game.schema";
import { compileCrossword } from "@/features/crossword/generator/crossword-generator";
import { normalizeGridAnswer } from "@/features/crossword/source/crossword-normalisation";
import type { CrosswordCompleteSourceRow } from "@/features/crossword/source/crossword-source.types";
import { parseDelimitedTable } from "@/lib/csv/parse-csv";

type RawClueBankRow = {
  bankNumber: number;
  sourceRowNumber: number;
  answer: string;
  clue: string;
  origin: "csv" | "supplemental";
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
  origin: "csv" | "supplemental";
};

type CandidateGroup = {
  normalizedAnswer: string;
  variants: CandidateRow[];
};

type GenerationSkip = {
  sourceRowNumber: number;
  clue: string;
  answer: string;
  reason: string;
};

type PuzzleMetrics = {
  rows: number;
  columns: number;
  totalCells: number;
  whiteCells: number;
  blackSquarePercentage: number;
  averageAnswerLength: number;
  shortEntryCount: number;
  bridgeEntryCount: number;
  anchorEntryCount: number;
  giantEntryCount: number;
  duplicateNormalizedAnswerCount: number;
  disconnectedWhiteAreas: number;
  zeroCrossingEntries: number;
  checkedLetterCount: number;
  checkedLetterRatio: number;
};

type EvaluatedPuzzle = {
  seed: string;
  score: number;
  compiledData: ReturnType<typeof crosswordCompiledDataSchema.parse>;
  placedRows: CandidateRow[];
  metrics: PuzzleMetrics;
  rejected: boolean;
  rejectionReason: string | null;
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
const MIN_GRID_SIZE = 9;
const MAX_GRID_SIZE = 17;
const MIN_CLUE_COUNT = 20;
const MAX_CLUE_COUNT = 50;
const MIN_GRID_ANSWER_LENGTH = Number(process.env.CROSSWORD_MIN_ANSWER_LENGTH ?? "3");
const CONTENT_VERSION = 7;
const TARGET_TOTAL_SELECTIONS = [50, 52, 54];
const MAX_PUZZLE_ATTEMPTS = Number(process.env.CROSSWORD_MAX_ATTEMPTS ?? "72");
const TARGET_PUZZLE_COUNT = Number(process.env.CROSSWORD_TARGET_PUZZLES ?? "18");
const DISABLE_AUTO_SUPPLEMENTAL = process.env.CROSSWORD_DISABLE_AUTO_SUPPLEMENTAL === "1";
const PREUSED_SOURCE_ROWS_FILE = process.env.CROSSWORD_PREUSED_SOURCE_ROWS_FILE ?? null;
const LEGACY_SLUGS = [
  "taras-birthday-crossword",
  "taras-birthday-crossword-2",
  "taras-birthday-crossword-3",
  "taras-birthday-crossword-4",
  "taras-birthday-crossword-5",
  "taras-birthday-crossword-6",
  "taras-birthday-crossword-7"
] as const;
const WEAK_SHORT_FILL = new Set([
  "AAA",
  "EPEE",
  "NAAN",
  "EERIE",
  "EEL",
  "OOH",
  "RA",
  "OBOE",
  "OREO",
  "AREA",
  "ERA",
  "IRE"
]);
const PRIORITY_ANCHORS = new Set([
  "KIMWEXLER",
  "JOHNNYDEPP",
  "LJUBLJANA",
  "THEWEEKND",
  "MULLINGAR",
  "WESTMEATH",
  "LEINSTER",
  "PRINCESSDONUT",
  "TERESACARMODY",
  "DAVIDFISHER",
  "SALLYROONEY",
  "THEMACCABEES",
  "STANLEYYELNATS",
  "THEFLORIDAPROJECT",
  "TWODOORCINEMACLUB",
  "BREADMEATSBREAD",
  "MANCHESTERCOUNCIL"
]);
const SUPPLEMENTAL_BRIDGE_ROWS: Array<{ clue: string; answer: string }> = [
  { clue: "Irish rural division", answer: "TOWNLAND" },
  { clue: "Raised road", answer: "CAUSEWAY" },
  { clue: "Deep green gem", answer: "EMERALD" },
  { clue: "Safe place for boats", answer: "HARBOUR" },
  { clue: "Speckled stone", answer: "GRANITE" },
  { clue: "Custom suit maker", answer: "TAILOR" },
  { clue: "Group of three", answer: "TRINITY" },
  { clue: "Tell aloud", answer: "NARRATE" },
  { clue: "Vacant play field", answer: "SANDLOT" },
  { clue: "Monastery walkway", answer: "CLOISTER" },
  { clue: "Wander without hurry", answer: "MEANDER" },
  { clue: "Banister", answer: "RAILING" },
  { clue: "Handheld light", answer: "LANTERN" },
  { clue: "Light-sensitive part of the eye", answer: "RETINA" },
  { clue: "Good manners", answer: "COURTESY" },
  { clue: "Touring crew member", answer: "ROADIE" },
  { clue: "Cinema surface", answer: "SCREEN" },
  { clue: "Installment of a series", answer: "EPISODE" },
  { clue: "Film length", answer: "RUNTIME" },
  { clue: "Names at the end", answer: "CREDITS" },
  { clue: "Studio outdoor set", answer: "BACKLOT" },
  { clue: "Movie preview", answer: "TRAILER" },
  { clue: "Edited sequence", answer: "MONTAGE" },
  { clue: "Costume department or closet", answer: "WARDROBE" },
  { clue: "Secret schemer", answer: "PLOTTER" },
  { clue: "Deleted filmed bit", answer: "OUTTAKE" },
  { clue: "Put under the stage light", answer: "SPOTLIT" },
  { clue: "Character conversation", answer: "DIALOGUE" },
  { clue: "Small china mug", answer: "TEACUP" },
  { clue: "Paper pad", answer: "NOTEBOOK" },
  { clue: "Shelf stopper", answer: "BOOKEND" },
  { clue: "Tiny text at a page bottom", answer: "FOOTNOTE" },
  { clue: "Animated short or comic panel", answer: "CARTOON" },
  { clue: "Old-school writer's supply", answer: "INKPOT" },
  { clue: "Next to the pillow", answer: "BEDSIDE" },
  { clue: "Lit by the night sky", answer: "MOONLIT" },
  { clue: "Blow for a sharp sound", answer: "WHISTLE" },
  { clue: "Bread-based lunch", answer: "SANDWICH" },
  { clue: "Logs for the hearth", answer: "FIREWOOD" },
  { clue: "Shiny tree trim", answer: "TINSEL" },
  { clue: "Tune", answer: "MELODY" },
  { clue: "Beat pattern", answer: "RHYTHM" },
  { clue: "Song refrain", answer: "CHORUS" },
  { clue: "Middle-eight connector", answer: "BRIDGE" },
  { clue: "Concert running order", answer: "SETLIST" },
  { clue: "Bonus song after applause", answer: "ENCORE" },
  { clue: "Rock's accented pulse", answer: "BACKBEAT" },
  { clue: "Pleasing blend of notes", answer: "HARMONY" },
  { clue: "High musical range", answer: "TREBLE" },
  { clue: "Record material", answer: "VINYL" },
  { clue: "Queued-up songs", answer: "PLAYLIST" },
  { clue: "Tune you can't shake", answer: "EARWORM" },
  { clue: "Curated cassette", answer: "MIXTAPE" },
  { clue: "Make louder", answer: "AMPLIFY" },
  { clue: "Speed of a song", answer: "TEMPO" },
  { clue: "Soundtrack, say", answer: "AUDIO" },
  { clue: "Justification", answer: "REASON" },
  { clue: "Small point", answer: "DETAIL" },
  { clue: "Connected", answer: "RELATED" },
  { clue: "Dawn", answer: "SUNRISE" },
  { clue: "Playfully needling", answer: "TEASING" },
  { clue: "Breakfast time", answer: "MORNING" },
  { clue: "Rough plan", answer: "OUTLINE" },
  { clue: "In tidy fashion", answer: "NEATLY" },
  { clue: "Strain in the air", answer: "TENSION" },
  { clue: "Glowing", answer: "RADIANT" },
  { clue: "Drinks mat", answer: "COASTER" },
  { clue: "Phone receiver", answer: "HANDSET" },
  { clue: "Inclination", answer: "LEANING" },
  { clue: "Twisting", answer: "WINDING" },
  { clue: "Less tame", answer: "WILDER" },
  { clue: "Start a flame", answer: "KINDLE" },
  { clue: "Fragrant flower", answer: "JASMINE" },
  { clue: "Main speech", answer: "KEYNOTE" },
  { clue: "Bright primary hue", answer: "YELLOW" },
  { clue: "Court fool", answer: "JESTER" },
  { clue: "Tea-boiling pot", answer: "KETTLE" },
  { clue: "Growing, like the moon", answer: "WAXING" },
  { clue: "Hard-earned sense", answer: "WISDOM" },
  { clue: "Inner core", answer: "KERNEL" }
];

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function getDistinctLetterCount(answer: string) {
  return new Set(answer).size;
}

function getVowelCount(answer: string) {
  return Array.from(answer).filter((character) => "AEIOUY".includes(character)).length;
}

function getCommonLetterCount(answer: string) {
  return Array.from(answer).filter((character) => "AERSTONLDMIU".includes(character)).length;
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
  const bankNumberIndex = normalizedHeaders.findIndex((value) => value === "banknumber");
  const sourceRowNumberIndex = normalizedHeaders.findIndex((value) => value === "sourcerownumber");
  const originIndex = normalizedHeaders.findIndex((value) => value === "origin");
  const clueIndex = normalizedHeaders.findIndex((value) => value === "clue");
  const answerIndex = normalizedHeaders.findIndex((value) => value === "answer");

  if (clueIndex === -1 || answerIndex === -1) {
    throw new Error("Crossword CSV must include clue and answer columns.");
  }

  return bodyRows
    .filter((row) => row.some((value) => value.trim().length > 0))
    .map((row, index) => ({
      bankNumber: Number.parseInt(String(row[bankNumberIndex] ?? ""), 10) || index + 1,
      sourceRowNumber: Number.parseInt(String(row[sourceRowNumberIndex] ?? ""), 10) || index + 2,
      clue: String(row[clueIndex] ?? "").trim(),
      answer: String(row[answerIndex] ?? "").trim(),
      origin:
        String(row[originIndex] ?? "").trim().toLowerCase() === "supplemental"
          ? ("supplemental" as const)
          : ("csv" as const)
    }));
}

function appendSupplementalRows(rawRows: RawClueBankRow[]) {
  if (DISABLE_AUTO_SUPPLEMENTAL) {
    return rawRows;
  }

  const seenPairs = new Set(rawRows.map((row) => `${row.clue}::${row.answer}`.toUpperCase()));
  const nextRows = [...rawRows];
  let bankNumber = rawRows.length + 1;
  let sourceRowNumber = rawRows.length + 2;

  for (const row of SUPPLEMENTAL_BRIDGE_ROWS) {
    const pairKey = `${row.clue}::${row.answer}`.toUpperCase();
    if (seenPairs.has(pairKey)) {
      continue;
    }

    nextRows.push({
      bankNumber,
      sourceRowNumber,
      clue: row.clue,
      answer: row.answer,
      origin: "supplemental"
    });
    seenPairs.add(pairKey);
    bankNumber += 1;
    sourceRowNumber += 1;
  }

  return nextRows;
}

function buildGenerationPool(rawRows: RawClueBankRow[]) {
  const candidates: CandidateRow[] = [];
  const skipped: GenerationSkip[] = [];

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

    if (normalized.value.length < MIN_GRID_ANSWER_LENGTH) {
      skipped.push({
        sourceRowNumber: row.sourceRowNumber,
        clue: row.clue,
        answer: row.answer,
        reason: `grid answer shorter than ${MIN_GRID_ANSWER_LENGTH} characters`
      });
      continue;
    }

    if (normalized.value.length > MAX_GRID_SIZE) {
      skipped.push({
        sourceRowNumber: row.sourceRowNumber,
        clue: row.clue,
        answer: row.answer,
        reason: `grid answer longer than ${MAX_GRID_SIZE} characters`
      });
      continue;
    }

    candidates.push({
      id: `crossword-source-row-${row.sourceRowNumber}`,
      bankNumber: row.bankNumber,
      sourceRowNumber: row.sourceRowNumber,
      clue: row.clue,
      answer: row.answer,
      sourceAnswer: row.answer,
      origin: row.origin,
      gridAnswer: normalized.value,
      status: "complete",
      issues: []
    });
  }

  return {
    candidates,
    skipped
  };
}

function groupCandidatesByAnswer(rows: CandidateRow[]) {
  const groups = new Map<string, CandidateGroup>();

  for (const row of rows) {
    const existing = groups.get(row.gridAnswer);
    if (existing) {
      existing.variants.push(row);
      continue;
    }

    groups.set(row.gridAnswer, {
      normalizedAnswer: row.gridAnswer,
      variants: [row]
    });
  }

  for (const group of groups.values()) {
    group.variants.sort((left, right) => left.sourceRowNumber - right.sourceRowNumber);
  }

  return [...groups.values()];
}

function chooseVariant(group: CandidateGroup, seed: string, usedSourceRows: Set<number>) {
  const random = hashSeed(seed);
  const preferredVariants = group.variants.filter((variant) => !usedSourceRows.has(variant.sourceRowNumber));
  const pool = preferredVariants.length > 0 ? preferredVariants : group.variants;
  return pool[Math.floor(random() * pool.length)] ?? pool[0];
}

function buildLayoutForRows(rows: CandidateRow[]) {
  const longestAnswer = Math.max(...rows.map((row) => row.gridAnswer.length));

  if (longestAnswer >= 16) {
    return {
      minRows: 12,
      maxRows: MAX_GRID_SIZE,
      minColumns: 12,
      maxColumns: MAX_GRID_SIZE,
      targetRows: 15,
      targetColumns: 15
    };
  }

  if (longestAnswer >= 14) {
    return {
      minRows: 12,
      maxRows: 15,
      minColumns: 12,
      maxColumns: 15,
      targetRows: 14,
      targetColumns: 14
    };
  }

  if (longestAnswer >= 12) {
    return {
      minRows: 11,
      maxRows: 14,
      minColumns: 11,
      maxColumns: 14,
      targetRows: 14,
      targetColumns: 14
    };
  }

  if (longestAnswer >= 10) {
    return {
      minRows: 10,
      maxRows: 14,
      minColumns: 10,
      maxColumns: 14,
      targetRows: 13,
      targetColumns: 13
    };
  }

  return {
    minRows: 10,
    maxRows: 13,
    minColumns: 10,
    maxColumns: 13,
    targetRows: 13,
    targetColumns: 13
  };
}

function countConnectedWhiteAreas(cells: Array<Array<{ solution: string | null }>>) {
  const rows = cells.length;
  const columns = cells[0]?.length ?? 0;
  const visited = new Set<string>();
  let components = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (!cells[row][column].solution) {
        continue;
      }

      const key = `${row},${column}`;
      if (visited.has(key)) {
        continue;
      }

      components += 1;
      const queue: Array<[number, number]> = [[row, column]];
      visited.add(key);

      while (queue.length > 0) {
        const [currentRow, currentColumn] = queue.shift()!;
        const neighbors: Array<[number, number]> = [
          [currentRow - 1, currentColumn],
          [currentRow + 1, currentColumn],
          [currentRow, currentColumn - 1],
          [currentRow, currentColumn + 1]
        ];

        for (const [neighborRow, neighborColumn] of neighbors) {
          if (
            neighborRow < 0 ||
            neighborRow >= rows ||
            neighborColumn < 0 ||
            neighborColumn >= columns ||
            !cells[neighborRow][neighborColumn].solution
          ) {
            continue;
          }

          const neighborKey = `${neighborRow},${neighborColumn}`;
          if (visited.has(neighborKey)) {
            continue;
          }

          visited.add(neighborKey);
          queue.push([neighborRow, neighborColumn]);
        }
      }
    }
  }

  return components;
}

function analyzePuzzle(compiledData: ReturnType<typeof crosswordCompiledDataSchema.parse>, placedRows: CandidateRow[]) {
  const totalCells = compiledData.rows * compiledData.columns;
  const whiteCells = compiledData.cells.flat().filter((cell) => cell.solution).length;
  const answerLengths = placedRows.map((row) => row.gridAnswer.length);
  const averageAnswerLength = sum(answerLengths) / Math.max(1, answerLengths.length);
  const shortEntryCount = answerLengths.filter((length) => length >= 3 && length <= 5).length;
  const bridgeEntryCount = answerLengths.filter((length) => length >= 6 && length <= 8).length;
  const anchorEntryCount = answerLengths.filter((length) => length >= 9).length;
  const giantEntryCount = answerLengths.filter((length) => length >= 12).length;
  const duplicateNormalizedAnswerCount = placedRows.length - new Set(placedRows.map((row) => row.gridAnswer)).size;
  const disconnectedWhiteAreas = countConnectedWhiteAreas(compiledData.cells);
  const entryCrossings = new Map<string, number>();
  let checkedLetterCount = 0;

  for (const cell of compiledData.cells.flat()) {
    if (!cell.solution || !cell.acrossEntryId || !cell.downEntryId) {
      continue;
    }

    checkedLetterCount += 1;
    entryCrossings.set(cell.acrossEntryId, (entryCrossings.get(cell.acrossEntryId) ?? 0) + 1);
    entryCrossings.set(cell.downEntryId, (entryCrossings.get(cell.downEntryId) ?? 0) + 1);
  }

  const zeroCrossingEntries = compiledData.entries.filter((entry) => (entryCrossings.get(entry.id) ?? 0) === 0).length;
  const blackSquarePercentage = totalCells === 0 ? 100 : ((totalCells - whiteCells) / totalCells) * 100;
  const checkedLetterRatio = whiteCells === 0 ? 0 : checkedLetterCount / whiteCells;

  return {
    rows: compiledData.rows,
    columns: compiledData.columns,
    totalCells,
    whiteCells,
    blackSquarePercentage,
    averageAnswerLength,
    shortEntryCount,
    bridgeEntryCount,
    anchorEntryCount,
    giantEntryCount,
    duplicateNormalizedAnswerCount,
    disconnectedWhiteAreas,
    zeroCrossingEntries,
    checkedLetterCount,
    checkedLetterRatio
  };
}

function scoreGroupSelection(
  group: CandidateGroup,
  activeLetters: Map<string, number>,
  bucket: "anchor" | "bridge" | "short",
  usedAnswerCounts: Map<string, number>,
  usedSourceRows: Set<number>
) {
  const answer = group.normalizedAnswer;
  const length = answer.length;
  const distinctLetterCount = getDistinctLetterCount(answer);
  const vowelCount = getVowelCount(answer);
  const commonLetterCount = getCommonLetterCount(answer);
  const uniqueOverlap = Array.from(new Set(answer)).filter((character) => activeLetters.has(character)).length;
  const totalOverlap = Array.from(answer).filter((character) => activeLetters.has(character)).length;
  const repeatedPenalty = Math.max(0, length - distinctLetterCount - 2) * 4;
  const vowelPenalty = Math.abs(vowelCount - length / 2) * 1.4;
  const weakPenalty = WEAK_SHORT_FILL.has(answer) ? 28 : 0;
  const priorityBonus = PRIORITY_ANCHORS.has(answer) ? 40 : 0;
  const sharedLetterBonus = uniqueOverlap * 18 + totalOverlap * 5;
  const hasCsvVariant = group.variants.some((variant) => variant.origin === "csv");
  const hasUnusedCsvVariant = group.variants.some(
    (variant) => variant.origin === "csv" && !usedSourceRows.has(variant.sourceRowNumber)
  );
  const hasUnusedVariant = group.variants.some((variant) => !usedSourceRows.has(variant.sourceRowNumber));
  const usageCount = usedAnswerCounts.get(answer) ?? 0;
  const usagePenalty = hasUnusedVariant ? Math.max(0, usageCount - 1) * 30 : usageCount * 90;
  const sourceBonus = hasUnusedCsvVariant ? 40 : hasCsvVariant ? 14 : -34;
  const overlapPenalty =
    activeLetters.size === 0
      ? 0
      : bucket === "anchor"
        ? uniqueOverlap === 0
          ? 90
          : 0
        : uniqueOverlap === 0
          ? 220
          : uniqueOverlap === 1
            ? 80
            : 0;
  const baseScore =
    distinctLetterCount * 8 + commonLetterCount * 3 - repeatedPenalty - vowelPenalty + priorityBonus + sourceBonus;

  if (bucket === "anchor") {
    return baseScore + length * 20 + sharedLetterBonus + (length >= 12 ? 18 : 0) - overlapPenalty - usagePenalty;
  }

  if (bucket === "bridge") {
    const bridgeBonus = length >= 6 && length <= 8 ? 42 : -40;
    const multiOverlapBonus = uniqueOverlap >= 2 ? 36 : 0;
    return (
      baseScore +
      bridgeBonus +
      sharedLetterBonus +
      multiOverlapBonus +
      length * 8 -
      weakPenalty -
      overlapPenalty -
      usagePenalty
    );
  }

  const shortBonus = length >= 3 && length <= 5 ? 16 : -40;
  const multiOverlapBonus = uniqueOverlap >= 2 ? 28 : 0;
  return (
    baseScore +
    shortBonus +
    sharedLetterBonus +
    multiOverlapBonus +
    length * 4 -
    weakPenalty -
    overlapPenalty -
    usagePenalty
  );
}

function addAnswerLetters(activeLetters: Map<string, number>, answer: string) {
  for (const character of answer) {
    activeLetters.set(character, (activeLetters.get(character) ?? 0) + 1);
  }
}

function pickFromBucket(
  groups: CandidateGroup[],
  targetCount: number,
  bucket: "anchor" | "bridge" | "short",
  selectedAnswers: Set<string>,
  activeLetters: Map<string, number>,
  seed: string,
  usedAnswerCounts: Map<string, number>,
  usedSourceRows: Set<number>
) {
  const random = hashSeed(seed);
  const picked: CandidateGroup[] = [];

  while (picked.length < targetCount) {
    const availablePool = groups.filter((group) => !selectedAnswers.has(group.normalizedAnswer));
    const remainingNeeded = targetCount - picked.length;
    const freshCsvAnswerPool = availablePool.filter(
      (group) =>
        (usedAnswerCounts.get(group.normalizedAnswer) ?? 0) === 0 &&
        group.variants.some((variant) => variant.origin === "csv" && !usedSourceRows.has(variant.sourceRowNumber))
    );
    const freshAnswerPool = availablePool.filter((group) => (usedAnswerCounts.get(group.normalizedAnswer) ?? 0) === 0);
    const unusedCsvVariantPool = availablePool.filter((group) =>
      group.variants.some((variant) => variant.origin === "csv" && !usedSourceRows.has(variant.sourceRowNumber))
    );
    const available =
      freshCsvAnswerPool.length >= remainingNeeded && freshCsvAnswerPool.length > 0
        ? freshCsvAnswerPool
        : freshAnswerPool.length >= remainingNeeded && freshAnswerPool.length > 0
          ? freshAnswerPool
          : unusedCsvVariantPool.length >= remainingNeeded && unusedCsvVariantPool.length > 0
            ? unusedCsvVariantPool
            : availablePool;
    if (available.length === 0) {
      break;
    }

    const scored = available
      .map((group) => ({
        group,
        score: scoreGroupSelection(group, activeLetters, bucket, usedAnswerCounts, usedSourceRows) + random() * 4
      }))
      .sort((left, right) => right.score - left.score);
    const topSlice = scored.slice(0, Math.min(8, scored.length));
    const choice = topSlice[Math.floor(random() * topSlice.length)]?.group ?? scored[0]?.group;

    if (!choice) {
      break;
    }

    picked.push(choice);
    selectedAnswers.add(choice.normalizedAnswer);
    addAnswerLetters(activeLetters, choice.normalizedAnswer);
  }

  return picked;
}

function buildTargetedSubset(
  groups: CandidateGroup[],
  puzzleIndex: number,
  attempt: number,
  usedAnchorAnswers: Set<string>,
  usedSourceRows: Set<number>,
  usedAnswerCounts: Map<string, number>
) {
  const seed = `crossword:${puzzleIndex}:${attempt}`;
  const random = hashSeed(seed);
  const preferredPool = groups.filter((group) => {
    const isAnchorLike = group.normalizedAnswer.length >= 9 || PRIORITY_ANCHORS.has(group.normalizedAnswer);
    return isAnchorLike ? !usedAnchorAnswers.has(group.normalizedAnswer) : true;
  });
  const fallbackPool = preferredPool.length >= MIN_CLUE_COUNT ? preferredPool : groups;
  const giantAnchors = fallbackPool.filter((group) => group.normalizedAnswer.length >= 12);
  const anchors = fallbackPool.filter(
    (group) => group.normalizedAnswer.length >= 9 && group.normalizedAnswer.length <= 11
  );
  const bridges = fallbackPool.filter(
    (group) => group.normalizedAnswer.length >= 6 && group.normalizedAnswer.length <= 8
  );
  const shorts = fallbackPool.filter((group) => group.normalizedAnswer.length >= 3 && group.normalizedAnswer.length <= 5);
  const selectedAnswers = new Set<string>();
  const activeLetters = new Map<string, number>();

  const anchorTarget = clamp(3 + Math.floor(random() * 1), 3, 3);
  const giantTarget = 0;
  const bridgeTarget = clamp(20 + Math.floor(random() * 3), 20, 22);
  const shortTarget = clamp(18 + Math.floor(random() * 3), 18, 20);
  const targetSelectionCount = TARGET_TOTAL_SELECTIONS[attempt % TARGET_TOTAL_SELECTIONS.length];
  const selectedGroups: CandidateGroup[] = [];
  const priorityAnchors = anchors.filter((group) => PRIORITY_ANCHORS.has(group.normalizedAnswer));

  if (priorityAnchors.length > 0) {
    const firstPriority = pickFromBucket(
      priorityAnchors,
      1,
      "anchor",
      selectedAnswers,
      activeLetters,
      `${seed}:priority`,
      usedAnswerCounts,
      usedSourceRows
    );
    selectedGroups.push(...firstPriority);
  }

  selectedGroups.push(
    ...pickFromBucket(
      giantAnchors,
      giantTarget,
      "anchor",
      selectedAnswers,
      activeLetters,
      `${seed}:giants`,
      usedAnswerCounts,
      usedSourceRows
    )
  );
  selectedGroups.push(
    ...pickFromBucket(
      anchors,
      anchorTarget - selectedGroups.length,
      "anchor",
      selectedAnswers,
      activeLetters,
      `${seed}:anchors`,
      usedAnswerCounts,
      usedSourceRows
    )
  );
  selectedGroups.push(
    ...pickFromBucket(
      bridges,
      bridgeTarget,
      "bridge",
      selectedAnswers,
      activeLetters,
      `${seed}:bridges`,
      usedAnswerCounts,
      usedSourceRows
    )
  );
  selectedGroups.push(
    ...pickFromBucket(
      shorts,
      shortTarget,
      "short",
      selectedAnswers,
      activeLetters,
      `${seed}:shorts`,
      usedAnswerCounts,
      usedSourceRows
    )
  );

  const allRemaining = fallbackPool.filter(
    (group) => !selectedAnswers.has(group.normalizedAnswer) && group.normalizedAnswer.length <= 15
  );
  while (selectedGroups.length < targetSelectionCount && allRemaining.length > 0) {
    const bucket = selectedGroups.length % 4 === 0 ? "bridge" : selectedGroups.length % 6 === 0 ? "anchor" : "short";
    const extra = pickFromBucket(
      allRemaining,
      1,
      bucket,
      selectedAnswers,
      activeLetters,
      `${seed}:extra:${selectedGroups.length}`,
      usedAnswerCounts,
      usedSourceRows
    );
    if (extra.length === 0) {
      break;
    }

    selectedGroups.push(...extra);
  }

  return selectedGroups.map((group, index) => chooseVariant(group, `${seed}:${group.normalizedAnswer}:${index}`, usedSourceRows));
}

function evaluateSubset(rows: CandidateRow[], seed: string): EvaluatedPuzzle | null {
  if (rows.length === 0) {
    return null;
  }

  const layout = buildLayoutForRows(rows);
  const result = compileCrossword({
    rows,
    seed,
    completion: DEFAULT_COMPLETION,
    layout
  });

  if (!result.compiledData) {
    return null;
  }

  const finalizedRows = result.placedRows as CandidateRow[];
  const metrics = analyzePuzzle(result.compiledData, finalizedRows);

  let rejectionReason: string | null = null;
  if (
    metrics.rows < MIN_GRID_SIZE ||
    metrics.rows > MAX_GRID_SIZE ||
    metrics.columns < MIN_GRID_SIZE ||
    metrics.columns > MAX_GRID_SIZE
  ) {
    rejectionReason = "grid size outside 9x9 to 17x17";
  } else if (finalizedRows.length < MIN_CLUE_COUNT || finalizedRows.length > MAX_CLUE_COUNT) {
    rejectionReason = "clue count outside 20-50";
  } else if (metrics.averageAnswerLength < 4.8) {
    rejectionReason = "average answer length below 4.8";
  } else if (metrics.anchorEntryCount === 0 || metrics.bridgeEntryCount < 7) {
    rejectionReason = "not enough 9+ anchors or 6-8 bridge entries";
  } else if (metrics.blackSquarePercentage > 50) {
    rejectionReason = "black-square percentage above 50";
  } else if (metrics.duplicateNormalizedAnswerCount > 0) {
    rejectionReason = "duplicate normalized answer inside puzzle";
  } else if (metrics.disconnectedWhiteAreas > 1 || metrics.zeroCrossingEntries > 0) {
    rejectionReason = "disconnected white cells or zero-crossing entry detected";
  } else if (metrics.giantEntryCount > 2) {
    rejectionReason = "more than two 12+ entries in a single puzzle";
  } else if (metrics.rows >= 16 && finalizedRows.length < 38) {
    rejectionReason = "large grid without enough clues";
  }

  const priorityAnchorCount = finalizedRows.filter((row) => PRIORITY_ANCHORS.has(row.gridAnswer)).length;
  const weakShortFillCount = finalizedRows.filter((row) => WEAK_SHORT_FILL.has(row.gridAnswer)).length;
  const score =
    finalizedRows.length * 150 +
    metrics.bridgeEntryCount * 42 +
    metrics.anchorEntryCount * 58 +
    priorityAnchorCount * 44 +
    metrics.averageAnswerLength * 92 +
    metrics.checkedLetterRatio * 1200 -
    metrics.blackSquarePercentage * 58 -
    Math.abs(metrics.rows - 14) * 18 -
    Math.abs(metrics.columns - 14) * 18 -
    Math.abs(metrics.rows - metrics.columns) * 14 -
    weakShortFillCount * 32;

  return {
    seed,
    score,
    compiledData: result.compiledData,
    placedRows: finalizedRows,
    metrics,
    rejected: rejectionReason !== null,
    rejectionReason
  };
}

function buildManifest(puzzles: EvaluatedPuzzle[]) {
  const startDate = new Date(Date.UTC(2026, 5, 30));

  return puzzles.map<PuzzleManifestRow>((puzzle, index) => {
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
  compiledData: EvaluatedPuzzle["compiledData"],
  placedRows: CandidateRow[],
  seed: string
) {
  const placedEntryIds = placedRows.map((row) => row.id);
  return crosswordCompiledDataSchema.parse({
    ...compiledData,
    generation: {
      ...compiledData.generation,
      seed,
      attemptedEntryIds: placedEntryIds,
      placedEntryIds,
      unplacedEntryIds: [],
      generatedAt: new Date().toISOString()
    }
  });
}

function buildSeededContent(manifest: PuzzleManifestRow[], puzzles: EvaluatedPuzzle[]) {
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

function findBestPuzzle(
  groups: CandidateGroup[],
  puzzleIndex: number,
  usedAnchorAnswers: Set<string>,
  usedSourceRows: Set<number>,
  usedAnswerCounts: Map<string, number>
) {
  let bestAccepted: EvaluatedPuzzle | null = null;
  let bestRejected: EvaluatedPuzzle | null = null;

  for (let attempt = 0; attempt < MAX_PUZZLE_ATTEMPTS; attempt += 1) {
    const seed = `targeted:${puzzleIndex}:${attempt}`;
    const subset = buildTargetedSubset(groups, puzzleIndex, attempt, usedAnchorAnswers, usedSourceRows, usedAnswerCounts);
    const evaluated = evaluateSubset(subset, seed);

    if (!evaluated) {
      continue;
    }

    if (evaluated.rejected) {
      if (!bestRejected || evaluated.score > bestRejected.score) {
        bestRejected = evaluated;
      }
      continue;
    }

    if (!bestAccepted || evaluated.score > bestAccepted.score) {
      bestAccepted = evaluated;
    }
  }

  return {
    bestAccepted,
    bestRejected
  };
}

function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    throw new Error("Usage: node scripts/regenerate-crossword-seeds.ts /absolute/path/to/clues.csv");
  }

  const rawRows = appendSupplementalRows(readCsvRows(csvPath));
  const { candidates, skipped } = buildGenerationPool(rawRows);
  const groups = groupCandidatesByAnswer(candidates);
  const acceptedPuzzles: EvaluatedPuzzle[] = [];
  const preusedSourceRows = PREUSED_SOURCE_ROWS_FILE
    ? new Set<number>(JSON.parse(fs.readFileSync(PREUSED_SOURCE_ROWS_FILE, "utf8")))
    : new Set<number>();
  const usedAnchorAnswers = new Set<string>();
  const usedSourceRows = new Set<number>(preusedSourceRows);
  const usedAnswerCounts = new Map<string, number>();
  const rejectedDiagnostics: EvaluatedPuzzle[] = [];

  for (const row of candidates) {
    if (!preusedSourceRows.has(row.sourceRowNumber)) {
      continue;
    }

    usedAnswerCounts.set(row.gridAnswer, (usedAnswerCounts.get(row.gridAnswer) ?? 0) + 1);
    if (row.gridAnswer.length >= 9 || PRIORITY_ANCHORS.has(row.gridAnswer)) {
      usedAnchorAnswers.add(row.gridAnswer);
    }
  }

  while (acceptedPuzzles.length < TARGET_PUZZLE_COUNT) {
    const { bestAccepted, bestRejected } = findBestPuzzle(
      groups,
      acceptedPuzzles.length,
      usedAnchorAnswers,
      usedSourceRows,
      usedAnswerCounts
    );

    if (!bestAccepted) {
      if (bestRejected) {
        rejectedDiagnostics.push(bestRejected);
      }
      break;
    }

    acceptedPuzzles.push(bestAccepted);
    for (const row of bestAccepted.placedRows) {
      usedSourceRows.add(row.sourceRowNumber);
      usedAnswerCounts.set(row.gridAnswer, (usedAnswerCounts.get(row.gridAnswer) ?? 0) + 1);
      if (row.gridAnswer.length >= 9 || PRIORITY_ANCHORS.has(row.gridAnswer)) {
        usedAnchorAnswers.add(row.gridAnswer);
      }
    }
  }

  if (acceptedPuzzles.length === 0) {
    throw new Error(
      `No valid crosswords could be generated from the provided clue bank. Best rejected candidate: ${
        rejectedDiagnostics[0]
          ? `${rejectedDiagnostics[0].metrics.rows}x${rejectedDiagnostics[0].metrics.columns}, ${rejectedDiagnostics[0].placedRows.length} clues, ${rejectedDiagnostics[0].metrics.blackSquarePercentage.toFixed(2)}% black, rejection: ${rejectedDiagnostics[0].rejectionReason}`
          : "none"
      }`
    );
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
          reason: "not selected for the regenerated crossword set"
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
          gridSize: `${puzzle.metrics.rows}x${puzzle.metrics.columns}`,
          clueCount: puzzle.placedRows.length,
          blackSquarePercentage: Number(puzzle.metrics.blackSquarePercentage.toFixed(2)),
          averageAnswerLength: Number(puzzle.metrics.averageAnswerLength.toFixed(2)),
          bridgeEntryCount: puzzle.metrics.bridgeEntryCount,
          anchorEntryCount: puzzle.metrics.anchorEntryCount,
          sourceRowNumbers: manifest[index].selectedSourceRowNumbers
        })),
        rejectedDiagnostics: rejectedDiagnostics.slice(0, 5).map((puzzle) => ({
          seed: puzzle.seed,
          gridSize: `${puzzle.metrics.rows}x${puzzle.metrics.columns}`,
          clueCount: puzzle.placedRows.length,
          blackSquarePercentage: Number(puzzle.metrics.blackSquarePercentage.toFixed(2)),
          averageAnswerLength: Number(puzzle.metrics.averageAnswerLength.toFixed(2)),
          bridgeEntryCount: puzzle.metrics.bridgeEntryCount,
          anchorEntryCount: puzzle.metrics.anchorEntryCount,
          rejectionReason: puzzle.rejectionReason
        })),
        skippedCount: unusedRows.length,
        skippedRows: unusedRows,
        supplementalBridgeEntriesAdded: rawRows.filter((row) => row.origin === "supplemental").length
      },
      null,
      2
    )
  );
}

main();
