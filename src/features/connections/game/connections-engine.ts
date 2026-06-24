import type {
  ConnectionsGameData,
  ConnectionsGroup,
  ConnectionsProgress,
  ConnectionsSubmitFeedback,
  ConnectionsTile
} from "@/features/connections/game/connections-game.types";
import { slugify } from "@/lib/utils/strings";

const MAX_MISTAKES = 4;

function hashValue(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function sortTileIds(tileIds: string[], seed: number) {
  return [...tileIds].sort((left, right) => {
    const leftScore = hashValue(`${seed}:${left}`);
    const rightScore = hashValue(`${seed}:${right}`);

    if (leftScore === rightScore) {
      return left.localeCompare(right);
    }

    return leftScore - rightScore;
  });
}

function markStarted(progress: ConnectionsProgress, now: string) {
  if (progress.startedAt) {
    return progress;
  }

  return {
    ...progress,
    startedAt: now
  };
}

export function flattenConnectionsTiles(gameData: ConnectionsGameData): ConnectionsTile[] {
  return gameData.groups.flatMap((group) =>
    group.items.map((item, index) => ({
      id: `${group.id}:${slugify(item)}:${index}`,
      label: item,
      groupId: group.id,
      category: group.category,
      difficulty: group.difficulty
    }))
  );
}

export function createConnectionsProgress(gameData: ConnectionsGameData): ConnectionsProgress {
  const tileIds = flattenConnectionsTiles(gameData).map((tile) => tile.id);

  return {
    schemaVersion: 1,
    selectedItemIds: [],
    solvedGroupIds: [],
    submittedGuesses: [],
    remainingTileIds: sortTileIds(tileIds, 0),
    mistakes: 0,
    shuffleSeed: 0,
    startedAt: null,
    completedAt: null,
    status: "playing"
  };
}

export function toggleConnectionsSelection(progress: ConnectionsProgress, tileId: string, now: string) {
  if (progress.status !== "playing") {
    return progress;
  }

  const selected = new Set(progress.selectedItemIds);

  if (selected.has(tileId)) {
    selected.delete(tileId);
  } else if (selected.size < 4) {
    selected.add(tileId);
  } else {
    return progress;
  }

  return {
    ...markStarted(progress, now),
    selectedItemIds: Array.from(selected)
  };
}

export function clearConnectionsSelection(progress: ConnectionsProgress) {
  if (progress.selectedItemIds.length === 0) {
    return progress;
  }

  return {
    ...progress,
    selectedItemIds: []
  };
}

export function shuffleConnectionsTiles(progress: ConnectionsProgress, now: string) {
  if (progress.status !== "playing") {
    return progress;
  }

  const nextSeed = progress.shuffleSeed + 1;

  return {
    ...markStarted(progress, now),
    shuffleSeed: nextSeed,
    remainingTileIds: sortTileIds(progress.remainingTileIds, nextSeed)
  };
}

export function getConnectionsGroupById(gameData: ConnectionsGameData, groupId: string) {
  return gameData.groups.find((group) => group.id === groupId) ?? null;
}

export function getSolvedConnectionsGroups(gameData: ConnectionsGameData, solvedGroupIds: string[]) {
  return solvedGroupIds
    .map((groupId) => getConnectionsGroupById(gameData, groupId))
    .filter((group): group is ConnectionsGroup => Boolean(group));
}

export function getRemainingConnectionsGroups(gameData: ConnectionsGameData, solvedGroupIds: string[]) {
  const solved = new Set(solvedGroupIds);
  return gameData.groups.filter((group) => !solved.has(group.id));
}

export function submitConnectionsSelection({
  gameData,
  progress,
  now
}: {
  gameData: ConnectionsGameData;
  progress: ConnectionsProgress;
  now: string;
}): {
  progress: ConnectionsProgress;
  feedback: ConnectionsSubmitFeedback;
} {
  if (progress.status !== "playing" || progress.selectedItemIds.length !== 4) {
    return {
      progress,
      feedback: {
        type: "miss"
      }
    };
  }

  const guessKey = [...progress.selectedItemIds].sort().join("|");

  if (progress.submittedGuesses.includes(guessKey)) {
    return {
      progress,
      feedback: {
        type: "duplicate"
      }
    };
  }

  const tileMap = new Map(flattenConnectionsTiles(gameData).map((tile) => [tile.id, tile]));
  const selectedTiles = progress.selectedItemIds
    .map((tileId) => tileMap.get(tileId))
    .filter((tile): tile is ConnectionsTile => Boolean(tile));
  const groupCounts = selectedTiles.reduce<Map<string, number>>((counts, tile) => {
    counts.set(tile.groupId, (counts.get(tile.groupId) ?? 0) + 1);
    return counts;
  }, new Map());

  const nextProgress = markStarted(progress, now);

  if (groupCounts.size === 1) {
    const solvedGroupId = selectedTiles[0]?.groupId;

    if (!solvedGroupId) {
      return {
        progress,
        feedback: {
          type: "miss"
        }
      };
    }

    const solvedGroupIds = [...nextProgress.solvedGroupIds, solvedGroupId];
    const remainingTileIds = nextProgress.remainingTileIds.filter((tileId) => !progress.selectedItemIds.includes(tileId));
    const complete = solvedGroupIds.length === gameData.groups.length;

    return {
      progress: {
        ...nextProgress,
        selectedItemIds: [],
        solvedGroupIds,
        submittedGuesses: [...nextProgress.submittedGuesses, guessKey],
        remainingTileIds,
        completedAt: complete ? now : null,
        status: complete ? "won" : "playing"
      },
      feedback: {
        type: "solved",
        groupId: solvedGroupId
      }
    };
  }

  const nextMistakes = nextProgress.mistakes + 1;
  const maxSharedGroupCount = Math.max(...groupCounts.values());
  const lost = nextMistakes >= MAX_MISTAKES;

  return {
    progress: {
      ...nextProgress,
      selectedItemIds: [],
      submittedGuesses: [...nextProgress.submittedGuesses, guessKey],
      mistakes: nextMistakes,
      completedAt: lost ? now : null,
      status: lost ? "lost" : "playing"
    },
    feedback: {
      type: lost ? "lost" : maxSharedGroupCount === 3 ? "one-away" : "miss"
    }
  };
}

export function getConnectionsStatusSummary(progress: ConnectionsProgress) {
  if (progress.completedAt) {
    return progress.status === "won" ? "completed" : "in-progress";
  }

  return progress.startedAt ? "in-progress" : "none";
}
