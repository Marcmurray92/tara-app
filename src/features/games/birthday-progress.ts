import type { GameType } from "@/features/games/game.types";
import { readLocalConnectionsStatus } from "@/features/connections/game/connections-storage";
import { readLocalCrosswordStatus } from "@/features/crossword/game/crossword-storage";
import { readLocalGuessingStatus } from "@/features/guessing/game/guessing-storage";

export type BirthdayGameStatus = "none" | "in-progress" | "completed";

export type BirthdayGameProgressItem = {
  type: GameType;
  title: string;
  shortTitle: string;
  href: string;
  teaser: string;
  status: BirthdayGameStatus;
};

export type BirthdayProgressSnapshot = {
  items: BirthdayGameProgressItem[];
  completedCount: number;
  allCompleted: boolean;
};

const CROSSWORD_PROGRESS_TARGETS = [
  { slug: "taras-birthday-crossword", contentVersion: 3 },
  { slug: "taras-birthday-crossword-2", contentVersion: 3 },
  { slug: "taras-birthday-crossword-3", contentVersion: 3 },
  { slug: "taras-birthday-crossword-4", contentVersion: 3 },
  { slug: "taras-birthday-crossword-5", contentVersion: 3 },
  { slug: "taras-birthday-crossword-6", contentVersion: 3 },
  { slug: "taras-birthday-crossword-7", contentVersion: 3 }
] as const;

const BASE_ITEMS: Omit<BirthdayGameProgressItem, "status">[] = [
  {
    type: "crossword",
    title: "Crossword",
    shortTitle: "Crossword",
    href: "/games/crossword",
    teaser: "Clue your way through Tara-coded grids."
  },
  {
    type: "connections",
    title: "Connections",
    shortTitle: "Connections",
    href: "/games/connections",
    teaser: "Spot the hidden category before the fourth miss lands."
  },
  {
    type: "guessing",
    title: "Guessing Game",
    shortTitle: "Guessing",
    href: "/games/guessing",
    teaser: "Match the review drag to the right film."
  }
];

function combineStatuses(statuses: BirthdayGameStatus[]): BirthdayGameStatus {
  if (statuses.includes("completed")) {
    return "completed";
  }

  if (statuses.includes("in-progress")) {
    return "in-progress";
  }

  return "none";
}

function readCrosswordCollectionStatus() {
  return combineStatuses(
    CROSSWORD_PROGRESS_TARGETS.map((target) => readLocalCrosswordStatus(target.slug, target.contentVersion))
  );
}

export function readBirthdayProgressSnapshot(): BirthdayProgressSnapshot {
  if (typeof window === "undefined") {
    return {
      items: BASE_ITEMS.map((item) => ({ ...item, status: "none" })),
      completedCount: 0,
      allCompleted: false
    };
  }

  const items: BirthdayGameProgressItem[] = BASE_ITEMS.map((item) => {
    if (item.type === "crossword") {
      return {
        ...item,
        status: readCrosswordCollectionStatus()
      };
    }

    if (item.type === "connections") {
      return {
        ...item,
        status: readLocalConnectionsStatus("tara-movie-connections", 1)
      };
    }

    return {
      ...item,
      status: readLocalGuessingStatus("tara-movie-guessing", 3)
    };
  });

  const completedCount = items.filter((item) => item.status === "completed").length;

  return {
    items,
    completedCount,
    allCompleted: completedCount === items.length
  };
}

export function getNextBirthdayGame(
  snapshot: BirthdayProgressSnapshot,
  currentGame?: GameType
) {
  const orderedItems = snapshot.items;
  const currentIndex = currentGame ? orderedItems.findIndex((item) => item.type === currentGame) : -1;

  if (currentIndex >= 0) {
    const forwardCandidate = orderedItems
      .slice(currentIndex + 1)
      .find((item) => item.status !== "completed");

    if (forwardCandidate) {
      return forwardCandidate;
    }
  }

  return orderedItems.find((item) => item.type !== currentGame && item.status !== "completed") ?? null;
}
