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

const CONTENT_VERSION = 3;

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
    description: "Compact mix of films, places, and short-fill crossings.",
    selectedSourceRowNumbers: [21, 22, 32, 68, 81, 90, 91, 101, 112, 113, 123, 129, 148, 151, 155, 164, 166, 171]
  },
  {
    slug: "taras-birthday-crossword-2",
    title: "Crossword 2",
    subtitle: null,
    description: "Books, TV, and cleaner short answers for steadier solving.",
    selectedSourceRowNumbers: [12, 27, 37, 77, 94, 95, 100, 107, 110, 115, 120, 137, 138, 142, 144, 145, 160, 174]
  },
  {
    slug: "taras-birthday-crossword-3",
    title: "Crossword 3",
    subtitle: null,
    description: "A compact grid with TV names, travel clues, and easier crosses.",
    selectedSourceRowNumbers: [13, 16, 30, 42, 43, 79, 92, 106, 114, 119, 121, 133, 141, 143, 147, 162, 163, 178]
  },
  {
    slug: "taras-birthday-crossword-4",
    title: "Crossword 4",
    subtitle: null,
    description: "Movie, food, and quote-heavy clues with a tight footprint.",
    selectedSourceRowNumbers: [24, 33, 73, 80, 93, 99, 102, 105, 111, 117, 122, 124, 140, 152, 156, 165, 168, 179]
  },
  {
    slug: "taras-birthday-crossword-5",
    title: "Crossword 5",
    subtitle: null,
    description: "Irish towns, drinks, quotes, and a few sharper cultural clues.",
    selectedSourceRowNumbers: [8, 20, 40, 66, 87, 97, 125, 132, 134, 135, 139, 153, 159, 161, 167, 170, 173, 177]
  },
  {
    slug: "taras-birthday-crossword-6",
    title: "Crossword 6",
    subtitle: null,
    description: "Travel, classics, and short fill built for a smaller grid.",
    selectedSourceRowNumbers: [19, 26, 38, 85, 88, 96, 104, 109, 118, 127, 130, 136, 149, 150, 157, 169, 181, 182]
  },
  {
    slug: "taras-birthday-crossword-7",
    title: "Crossword 7",
    subtitle: null,
    description: "Final compact board with movies, TV, and faster fill words.",
    selectedSourceRowNumbers: [5, 69, 72, 82, 83, 86, 89, 98, 108, 116, 126, 128, 146, 154, 158, 172, 183, 184]
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
