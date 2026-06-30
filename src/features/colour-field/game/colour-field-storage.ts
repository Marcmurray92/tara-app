import { colourFieldProgressSchema } from "@/features/colour-field/game/colour-field-game.schema";
import type { ColourFieldGameData, ColourFieldProgress } from "@/features/colour-field/game/colour-field-game.types";
import { readColourFieldStatusSummary } from "@/features/colour-field/game/colour-field-engine";
import type { GameProgressEnvelope } from "@/features/games/progress-envelope";
import { dispatchBirthdayProgressEvent } from "@/features/games/progress-events";

const STORAGE_PREFIX = "tara30:colour-field";
const PROGRESS_SCHEMA_VERSION = 2;

function hasWindow() {
  return typeof window !== "undefined";
}

export function getColourFieldProgressKey(slug: string, contentVersion: number) {
  return `${STORAGE_PREFIX}:${slug}:content-v${contentVersion}:progress-v${PROGRESS_SCHEMA_VERSION}`;
}

export function loadColourFieldProgress(slug: string, contentVersion: number) {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(getColourFieldProgressKey(slug, contentVersion));

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GameProgressEnvelope<ColourFieldProgress>;

    if (parsed.contentVersion !== contentVersion || parsed.slug !== slug) {
      return null;
    }

    return colourFieldProgressSchema.parse(parsed.payload);
  } catch {
    window.localStorage.removeItem(getColourFieldProgressKey(slug, contentVersion));
    return null;
  }
}

export function saveColourFieldProgress({
  slug,
  contentVersion,
  progress
}: {
  slug: string;
  contentVersion: number;
  progress: ColourFieldProgress;
}) {
  if (!hasWindow()) {
    return;
  }

  const envelope: GameProgressEnvelope<ColourFieldProgress> = {
    gameType: "colour-field",
    slug,
    contentVersion,
    progressSchemaVersion: PROGRESS_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    payload: progress
  };

  window.localStorage.setItem(getColourFieldProgressKey(slug, contentVersion), JSON.stringify(envelope));
  dispatchBirthdayProgressEvent();
}

export function clearColourFieldProgress(slug: string, contentVersion: number) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(getColourFieldProgressKey(slug, contentVersion));
  dispatchBirthdayProgressEvent();
}

export function readLocalColourFieldStatus(
  slug: string,
  contentVersion: number,
  gameData: ColourFieldGameData
) {
  const progress = loadColourFieldProgress(slug, contentVersion);

  if (!progress) {
    return "none";
  }

  return readColourFieldStatusSummary(gameData, progress);
}
