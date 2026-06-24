import { guessingProgressSchema } from "@/features/guessing/game/guessing-game.schema";
import type { GuessingProgress } from "@/features/guessing/game/guessing-game.types";
import { getGuessingStatusSummary } from "@/features/guessing/game/guessing-engine";
import type { GameProgressEnvelope } from "@/features/games/progress-envelope";

const STORAGE_PREFIX = "tara30:guessing";
const PROGRESS_SCHEMA_VERSION = 1;

function hasWindow() {
  return typeof window !== "undefined";
}

export function getGuessingProgressKey(slug: string, contentVersion: number) {
  return `${STORAGE_PREFIX}:${slug}:content-v${contentVersion}:progress-v${PROGRESS_SCHEMA_VERSION}`;
}

export function loadGuessingProgress(slug: string, contentVersion: number) {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(getGuessingProgressKey(slug, contentVersion));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GameProgressEnvelope<GuessingProgress>;
    if (parsed.contentVersion !== contentVersion || parsed.slug !== slug) {
      return null;
    }

    return guessingProgressSchema.parse(parsed.payload);
  } catch {
    window.localStorage.removeItem(getGuessingProgressKey(slug, contentVersion));
    return null;
  }
}

export function saveGuessingProgress({
  slug,
  contentVersion,
  progress
}: {
  slug: string;
  contentVersion: number;
  progress: GuessingProgress;
}) {
  if (!hasWindow()) {
    return;
  }

  const envelope: GameProgressEnvelope<GuessingProgress> = {
    gameType: "guessing",
    slug,
    contentVersion,
    progressSchemaVersion: PROGRESS_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    payload: progress
  };

  window.localStorage.setItem(getGuessingProgressKey(slug, contentVersion), JSON.stringify(envelope));
}

export function clearGuessingProgress(slug: string, contentVersion: number) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(getGuessingProgressKey(slug, contentVersion));
}

export function readLocalGuessingStatus(slug: string, contentVersion: number) {
  const progress = loadGuessingProgress(slug, contentVersion);

  if (!progress) {
    return "none";
  }

  return getGuessingStatusSummary(progress);
}
