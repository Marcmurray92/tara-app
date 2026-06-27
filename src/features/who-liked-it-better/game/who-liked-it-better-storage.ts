import { whoLikedItBetterProgressSchema } from "@/features/who-liked-it-better/game/who-liked-it-better-game.schema";
import type { WhoLikedItBetterProgress } from "@/features/who-liked-it-better/game/who-liked-it-better-game.types";
import { getWhoLikedItBetterStatusSummary } from "@/features/who-liked-it-better/game/who-liked-it-better-engine";
import type { GameProgressEnvelope } from "@/features/games/progress-envelope";
import { dispatchBirthdayProgressEvent } from "@/features/games/progress-events";

const STORAGE_PREFIX = "tara30:who-liked-it-better";
const PROGRESS_SCHEMA_VERSION = 1;

function hasWindow() {
  return typeof window !== "undefined";
}

export function getWhoLikedItBetterProgressKey(slug: string, contentVersion: number) {
  return `${STORAGE_PREFIX}:${slug}:content-v${contentVersion}:progress-v${PROGRESS_SCHEMA_VERSION}`;
}

export function loadWhoLikedItBetterProgress(slug: string, contentVersion: number) {
  if (!hasWindow()) {
    return null;
  }

  const key = getWhoLikedItBetterProgressKey(slug, contentVersion);
  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GameProgressEnvelope<WhoLikedItBetterProgress>;
    if (parsed.contentVersion !== contentVersion || parsed.slug !== slug) {
      return null;
    }

    return whoLikedItBetterProgressSchema.parse(parsed.payload);
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function saveWhoLikedItBetterProgress({
  slug,
  contentVersion,
  progress
}: {
  slug: string;
  contentVersion: number;
  progress: WhoLikedItBetterProgress;
}) {
  if (!hasWindow()) {
    return;
  }

  const envelope: GameProgressEnvelope<WhoLikedItBetterProgress> = {
    gameType: "who-liked-it-better",
    slug,
    contentVersion,
    progressSchemaVersion: PROGRESS_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    payload: progress
  };

  window.localStorage.setItem(getWhoLikedItBetterProgressKey(slug, contentVersion), JSON.stringify(envelope));
  dispatchBirthdayProgressEvent();
}

export function clearWhoLikedItBetterProgress(slug: string, contentVersion: number) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(getWhoLikedItBetterProgressKey(slug, contentVersion));
  dispatchBirthdayProgressEvent();
}

export function readLocalWhoLikedItBetterStatus(slug: string, contentVersion: number) {
  const progress = loadWhoLikedItBetterProgress(slug, contentVersion);

  if (!progress) {
    return "none";
  }

  return getWhoLikedItBetterStatusSummary(progress);
}
