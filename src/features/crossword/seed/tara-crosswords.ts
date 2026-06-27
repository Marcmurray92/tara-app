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
  subtitle?: string | null;
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
  subtitle?: string | null;
  description: string;
  selectedSourceRowNumbers: number[];
};

const CONTENT_VERSION = 5;

const DEFAULT_COMPLETION = {
  title: "Puzzle complete",
  message: "You finished this grid. There are more waiting when you want another round.",
  actionLabel: "More crosswords",
  actionHref: "/games/crossword"
} as const;

const CROSSWORD_BLUEPRINTS: SeededCrosswordBlueprint[] = [
  {
    slug: "taras-birthday-crossword",
    title: "Crossword 1",
    subtitle: null,
    description: "Indie bands, pop lyrics, and a denser little board.",
    selectedSourceRowNumbers: [80, 82, 89, 95, 105, 134, 170, 172, 179, 185, 190, 194, 196, 213, 216, 218, 220, 227, 242, 243]
  },
  {
    slug: "taras-birthday-crossword-2",
    title: "Crossword 2",
    subtitle: null,
    description: "Lyrics, capitals, and a tighter short-fill mix.",
    selectedSourceRowNumbers: [32, 69, 111, 120, 122, 125, 156, 167, 174, 177, 184, 186, 187, 191, 195, 215, 233, 237, 238, 241]
  },
  {
    slug: "taras-birthday-crossword-3",
    title: "Crossword 3",
    subtitle: null,
    description: "Dublin nods, little words, and steadier geography fill.",
    selectedSourceRowNumbers: [19, 77, 86, 90, 91, 116, 121, 128, 143, 145, 149, 151, 159, 180, 189, 198, 209, 222, 225, 244]
  },
  {
    slug: "taras-birthday-crossword-4",
    title: "Crossword 4",
    subtitle: null,
    description: "Cult film bits, capitals, and a few strange little creatures.",
    selectedSourceRowNumbers: [72, 83, 85, 107, 109, 117, 147, 155, 164, 165, 176, 182, 183, 203, 211, 214, 228, 231, 232, 240]
  },
  {
    slug: "taras-birthday-crossword-5",
    title: "Crossword 5",
    subtitle: null,
    description: "Pints, books, pub words, and a stronger Irish thread.",
    selectedSourceRowNumbers: [68, 73, 81, 93, 115, 124, 132, 137, 152, 157, 166, 171, 178, 199, 206, 212, 219, 223, 229, 235]
  },
  {
    slug: "taras-birthday-crossword-6",
    title: "Crossword 6",
    subtitle: null,
    description: "Shorter punchy fill with books, cartoons, and critters.",
    selectedSourceRowNumbers: [88, 92, 100, 102, 106, 114, 123, 139, 146, 154, 158, 161, 168, 173, 200, 202, 208, 224, 226, 234]
  },
  {
    slug: "taras-birthday-crossword-7",
    title: "Crossword 7",
    subtitle: null,
    description: "Travel, pints, and a slightly sharper final board.",
    selectedSourceRowNumbers: [13, 27, 87, 99, 101, 113, 119, 135, 148, 150, 160, 163, 169, 175, 181, 192, 201, 204, 236, 239]
  }
];

const clueBankBySourceRow = new Map<number, CrosswordClueBankRow>(
  (crosswordClueBank as CrosswordClueBankRow[]).map((row) => [row.sourceRowNumber, row])
);

function buildRows(slug: string, selectedSourceRowNumbers: number[]) {
  return selectedSourceRowNumbers.map<CrosswordCompleteSourceRow>((sourceRowNumber) => {
    const source = clueBankBySourceRow.get(sourceRowNumber);

    if (!source) {
      throw new Error(`Missing crossword clue bank row ${sourceRowNumber} for ${slug}.`);
    }

    const normalized = normalizeGridAnswer(source.answer);
    if (!normalized.ok) {
      throw new Error(`Could not normalize crossword answer "${source.answer}" for ${slug}: ${normalized.reason}`);
    }

    return {
      id: `${slug}-clue-${source.sourceRowNumber}`,
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
  const rows = buildRows(blueprint.slug, blueprint.selectedSourceRowNumbers);
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
        detectedHeaders: ["ANSWER", "CLUE"],
        unknownHeaders: [],
        ignoredBlankRows: 22
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
