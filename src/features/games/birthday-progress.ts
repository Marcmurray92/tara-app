import { readLocalColourFieldStatus } from "@/features/colour-field/game/colour-field-storage";
import {
  listSeededColourFieldSummaries,
  placeholderColourFieldContentVersion,
  placeholderColourFieldGameData,
  placeholderColourFieldSlug
} from "@/features/colour-field/seed/placeholder-colour-field";
import type { GameType } from "@/features/games/game.types";
import { readLocalConnectionsStatus } from "@/features/connections/game/connections-storage";
import { listSeededConnectionsSummaries } from "@/features/connections/seed/placeholder-connections";
import { readLocalCrosswordStatus } from "@/features/crossword/game/crossword-storage";
import { listSeededCrosswordSummaries } from "@/features/crossword/seed/tara-crosswords";
import { readLocalGuessingStatus } from "@/features/guessing/game/guessing-storage";
import { placeholderGuessingContentVersion, placeholderGuessingSlug } from "@/features/guessing/seed/placeholder-guessing";
import { readLocalWhoLikedItBetterStatus } from "@/features/who-liked-it-better/game/who-liked-it-better-storage";
import {
  placeholderWhoLikedItBetterContentVersion,
  placeholderWhoLikedItBetterSlug
} from "@/features/who-liked-it-better/seed/placeholder-who-liked-it-better";

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

const CROSSWORD_PROGRESS_TARGETS = listSeededCrosswordSummaries().map((crossword) => ({
  slug: crossword.slug,
  contentVersion: crossword.contentVersion
}));

const CONNECTIONS_PROGRESS_TARGETS = listSeededConnectionsSummaries().map((board) => ({
  slug: board.slug,
  contentVersion: board.contentVersion
}));

const COLOUR_FIELD_PROGRESS_TARGETS = listSeededColourFieldSummaries().map((pack) => ({
  slug: pack.slug,
  contentVersion: pack.contentVersion
}));

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
    title: "Movie Review Guess",
    shortTitle: "Review Guess",
    href: "/games/guessing",
    teaser: "Three review screenshots. Two mistakes each. Pure cinema pressure."
  },
  {
    type: "who-liked-it-better",
    title: "Who Liked It Better",
    shortTitle: "Liked It Better",
    href: "/games/who-liked-it-better",
    teaser: "Choose whether Tara or the celeb went harder for the film."
  },
  {
    type: "colour-field",
    title: "Colour Field",
    shortTitle: "Colour Field",
    href: "/games/colour-field",
    teaser: "Swap each tile back into harmony and keep the anchors untouched."
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

function readConnectionsCollectionStatus() {
  return combineStatuses(
    CONNECTIONS_PROGRESS_TARGETS.map((target) => readLocalConnectionsStatus(target.slug, target.contentVersion))
  );
}

function readColourFieldCollectionStatus() {
  return combineStatuses(
    COLOUR_FIELD_PROGRESS_TARGETS.map((target) =>
      readLocalColourFieldStatus(target.slug, target.contentVersion, placeholderColourFieldGameData)
    )
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
        status: readConnectionsCollectionStatus()
      };
    }

    if (item.type === "who-liked-it-better") {
      return {
        ...item,
        status: readLocalWhoLikedItBetterStatus(
          placeholderWhoLikedItBetterSlug,
          placeholderWhoLikedItBetterContentVersion
        )
      };
    }

    if (item.type === "colour-field") {
      return {
        ...item,
        status: readColourFieldCollectionStatus()
      };
    }

    return {
      ...item,
      status: readLocalGuessingStatus(placeholderGuessingSlug, placeholderGuessingContentVersion)
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
