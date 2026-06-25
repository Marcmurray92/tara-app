import type { GameProgressEnvelope } from "@/features/games/progress-envelope";
import { dispatchBirthdayProgressEvent } from "@/features/games/progress-events";
import { crosswordProgressSchema } from "@/features/crossword/game/crossword-game.schema";
import type { CrosswordProgress } from "@/features/crossword/game/crossword-game.types";

const STORAGE_PREFIX = "tara30:crossword";
const PROGRESS_SCHEMA_VERSION = 1;

export function getCrosswordProgressKey(slug: string, contentVersion: number) {
  return `${STORAGE_PREFIX}:${slug}:content-v${contentVersion}:progress-v${PROGRESS_SCHEMA_VERSION}`;
}

function hasWindow() {
  return typeof window !== "undefined";
}

export function loadCrosswordProgress(slug: string, contentVersion: number) {
  if (!hasWindow()) {
    return null;
  }

  const key = getCrosswordProgressKey(slug, contentVersion);
  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GameProgressEnvelope<CrosswordProgress>;
    if (parsed.contentVersion !== contentVersion || parsed.slug !== slug) {
      return null;
    }

    return crosswordProgressSchema.parse(parsed.payload);
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function saveCrosswordProgress({
  slug,
  contentVersion,
  progress
}: {
  slug: string;
  contentVersion: number;
  progress: CrosswordProgress;
}) {
  if (!hasWindow()) {
    return;
  }

  const key = getCrosswordProgressKey(slug, contentVersion);
  const envelope: GameProgressEnvelope<CrosswordProgress> = {
    gameType: "crossword",
    slug,
    contentVersion,
    progressSchemaVersion: PROGRESS_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    payload: progress
  };

  window.localStorage.setItem(key, JSON.stringify(envelope));
  dispatchBirthdayProgressEvent();
}

export function clearCrosswordProgress(slug: string, contentVersion: number) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(getCrosswordProgressKey(slug, contentVersion));
  dispatchBirthdayProgressEvent();
}

export function readLocalCrosswordStatus(slug: string, contentVersion: number) {
  const progress = loadCrosswordProgress(slug, contentVersion);

  if (!progress) {
    return "none";
  }

  if (progress.completedAt) {
    return "completed";
  }

  const hasValues = progress.cells.some((row) => row.some((cell) => cell.value.length > 0 || cell.revealed));
  return hasValues ? "in-progress" : "none";
}
