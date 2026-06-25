import crosswordClueBank from "@/features/crossword/seed/tara-crossword-clue-bank.json";
import { compileCrossword } from "@/features/crossword/generator/crossword-generator";
import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import { createCrosswordSourceDataEnvelope } from "@/features/crossword/source/crossword-source-data";
import { normalizeGridAnswer } from "@/features/crossword/source/crossword-normalisation";
import type { CrosswordCompleteSourceRow } from "@/features/crossword/source/crossword-source.types";

type CrosswordClueBankRow = {
  bankNumber: number;
  sourceRowNumber: number;
  answer: string;
  clue: string;
};

export type SeededCrosswordContent = {
  slug: string;
  href: string;
  title: string;
  subtitle: string;
  description: string;
  contentVersion: number;
  clueCount: number;
  sourceRows: CrosswordCompleteSourceRow[];
  sourceData: ReturnType<typeof createCrosswordSourceDataEnvelope>;
  compiledData: CrosswordCompiledData;
};

type SeededCrosswordBlueprint = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  selectedBankNumbers: number[];
};

const CONTENT_VERSION = 2;

const DEFAULT_COMPLETION = {
  title: "Puzzle complete",
  message: "You finished this grid. There are more waiting when you want another round.",
  actionLabel: "More crosswords",
  actionHref: "/games/crossword"
} as const;

const CROSSWORD_BLUEPRINTS: SeededCrosswordBlueprint[] = [
  {
    slug: "taras-birthday-crossword",
    title: "Tara's Crossword 1",
    subtitle: "Films, books, and a little Holes",
    description: "A balanced opener pulling from the clue bank's movie, book, and Holes entries.",
    selectedBankNumbers: [1, 2, 3, 4, 9, 10, 11, 12, 25, 33, 44, 54, 55, 56, 57, 58, 59, 64]
  },
  {
    slug: "taras-birthday-crossword-2",
    title: "Tara's Crossword 2",
    subtitle: "Very important work",
    description: "TV favourites, a little pop culture, and shorter glue clues to keep the crossings fair.",
    selectedBankNumbers: [6, 7, 16, 28, 60, 61, 62, 63, 68, 70, 71, 72, 73, 74, 76, 86, 88, 92]
  },
  {
    slug: "taras-birthday-crossword-3",
    title: "Tara's Crossword 3",
    subtitle: "Office weirdos and dinner drama",
    description: "A mix of Succession, Severance, food, and assorted chaos from the clue bank.",
    selectedBankNumbers: [31, 45, 47, 48, 50, 51, 66, 75, 77, 79, 81, 82, 83, 84, 89, 90, 93, 94]
  },
  {
    slug: "taras-birthday-crossword-4",
    title: "Tara's Crossword 4",
    subtitle: "Actors, quotes, and pints",
    description: "Screen people, memorable lines, and a few easier crossings for breathing room.",
    selectedBankNumbers: [34, 35, 36, 38, 39, 53, 69, 96, 97, 98, 100, 101, 102, 103, 104, 105, 107, 108]
  },
  {
    slug: "taras-birthday-crossword-5",
    title: "Tara's Crossword 5",
    subtitle: "Snacks, towns, and one stupid book cat",
    description: "Irish places, food, film lines, and a few very specific Tara-and-Marc clues.",
    selectedBankNumbers: [18, 19, 20, 23, 24, 26, 42, 43, 46, 109, 110, 111, 130, 131, 132, 133, 134, 135]
  },
  {
    slug: "taras-birthday-crossword-6",
    title: "Tara's Crossword 6",
    subtitle: "Capitals and classics",
    description: "General-knowledge capitals with a couple of literary anchors to keep the set warm.",
    selectedBankNumbers: [112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 124, 125, 127, 128, 129, 138, 139]
  },
  {
    slug: "taras-birthday-crossword-7",
    title: "Tara's Crossword 7",
    subtitle: "Bonus troublemakers",
    description: "The trickier leftovers from the clue bank, balanced with a few friendlier crossings.",
    selectedBankNumbers: [13, 14, 15, 17, 21, 30, 32, 37, 41, 67, 80, 85, 95, 106, 123, 126, 136, 137]
  }
];

const clueBankByNumber = new Map<number, CrosswordClueBankRow>(
  (crosswordClueBank as CrosswordClueBankRow[]).map((row) => [row.bankNumber, row])
);

function buildRows(slug: string, selectedBankNumbers: number[]) {
  return selectedBankNumbers.map<CrosswordCompleteSourceRow>((bankNumber) => {
    const source = clueBankByNumber.get(bankNumber);

    if (!source) {
      throw new Error(`Missing crossword clue bank row ${bankNumber} for ${slug}.`);
    }

    const normalized = normalizeGridAnswer(source.answer);
    if (!normalized.ok) {
      throw new Error(`Could not normalize crossword answer "${source.answer}" for ${slug}: ${normalized.reason}`);
    }

    return {
      id: `${slug}-clue-${bankNumber}`,
      sourceRowNumber: source.sourceRowNumber,
      clue: source.clue,
      answer: source.answer,
      gridAnswer: normalized.value,
      status: "complete",
      issues: []
    };
  });
}

function buildSeededCrossword(blueprint: SeededCrosswordBlueprint): SeededCrosswordContent {
  const rows = buildRows(blueprint.slug, blueprint.selectedBankNumbers);
  const seed = `${blueprint.slug}-v${CONTENT_VERSION}`;
  const compilation = compileCrossword({
    rows,
    seed,
    completion: DEFAULT_COMPLETION
  });

  if (!compilation.compiledData || compilation.placedRows.length !== rows.length || compilation.unplacedRows.length > 0) {
    throw new Error(`Failed to compile seeded crossword "${blueprint.slug}" cleanly.`);
  }

  const sourceData = createCrosswordSourceDataEnvelope({
    rows,
    authoring: {
      selectedRowIds: rows.map((row) => row.id),
      seed,
      completion: DEFAULT_COMPLETION,
      importMetadata: {
        detectedHeaders: ["Number", "Answer", "Clue"],
        unknownHeaders: [],
        ignoredBlankRows: 0
      }
    }
  });

  return {
    slug: blueprint.slug,
    href: `/games/crossword/${blueprint.slug}`,
    title: blueprint.title,
    subtitle: blueprint.subtitle,
    description: blueprint.description,
    contentVersion: CONTENT_VERSION,
    clueCount: rows.length,
    sourceRows: rows,
    sourceData,
    compiledData: compilation.compiledData
  };
}

export const seededCrosswords = CROSSWORD_BLUEPRINTS.map((blueprint) => buildSeededCrossword(blueprint));

const seededCrosswordMap = new Map(seededCrosswords.map((crossword) => [crossword.slug, crossword]));

export function getSeededCrosswordBySlug(slug: string) {
  return seededCrosswordMap.get(slug) ?? null;
}

export function getDefaultSeededCrossword() {
  const crossword = seededCrosswords[0];

  if (!crossword) {
    throw new Error("At least one seeded crossword is required.");
  }

  return crossword;
}

export function listSeededCrosswordSummaries() {
  return seededCrosswords.map((crossword) => ({
    slug: crossword.slug,
    href: crossword.href,
    title: crossword.title,
    subtitle: crossword.subtitle,
    description: crossword.description,
    contentVersion: crossword.contentVersion,
    clueCount: crossword.clueCount
  }));
}
