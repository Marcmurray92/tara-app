import { connectionsProgressSchema } from "@/features/connections/game/connections-game.schema";
import type { ConnectionsProgress } from "@/features/connections/game/connections-game.types";
import { getConnectionsStatusSummary } from "@/features/connections/game/connections-engine";
import type { GameProgressEnvelope } from "@/features/games/progress-envelope";
import { dispatchBirthdayProgressEvent } from "@/features/games/progress-events";

const STORAGE_PREFIX = "tara30:connections";
const PROGRESS_SCHEMA_VERSION = 3;

function hasWindow() {
  return typeof window !== "undefined";
}

export function getConnectionsProgressKey(slug: string, contentVersion: number) {
  return `${STORAGE_PREFIX}:${slug}:content-v${contentVersion}:progress-v${PROGRESS_SCHEMA_VERSION}`;
}

export function loadConnectionsProgress(slug: string, contentVersion: number) {
  if (!hasWindow()) {
    return null;
  }

  const key = getConnectionsProgressKey(slug, contentVersion);
  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as GameProgressEnvelope<ConnectionsProgress>;
    if (parsed.contentVersion !== contentVersion || parsed.slug !== slug) {
      return null;
    }

    return connectionsProgressSchema.parse(parsed.payload);
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function saveConnectionsProgress({
  slug,
  contentVersion,
  progress
}: {
  slug: string;
  contentVersion: number;
  progress: ConnectionsProgress;
}) {
  if (!hasWindow()) {
    return;
  }

  const envelope: GameProgressEnvelope<ConnectionsProgress> = {
    gameType: "connections",
    slug,
    contentVersion,
    progressSchemaVersion: PROGRESS_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    payload: progress
  };

  window.localStorage.setItem(getConnectionsProgressKey(slug, contentVersion), JSON.stringify(envelope));
  dispatchBirthdayProgressEvent();
}

export function clearConnectionsProgress(slug: string, contentVersion: number) {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(getConnectionsProgressKey(slug, contentVersion));
  dispatchBirthdayProgressEvent();
}

export function readLocalConnectionsStatus(slug: string, contentVersion: number) {
  const progress = loadConnectionsProgress(slug, contentVersion);

  if (!progress) {
    return "none";
  }

  return getConnectionsStatusSummary(progress);
}
