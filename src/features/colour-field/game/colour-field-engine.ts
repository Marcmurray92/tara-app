import type {
  ColourFieldBoardTile,
  ColourFieldGameData,
  ColourFieldLevelData,
  ColourFieldLevelProgress,
  ColourFieldProgress
} from "@/features/colour-field/game/colour-field-game.types";

type Oklab = {
  l: number;
  a: number;
  b: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex: string) {
  const normalized = hex.trim().replace("#", "");

  if (normalized.length !== 6) {
    throw new Error(`Expected a 6-digit hex colour, received "${hex}".`);
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16) / 255,
    g: Number.parseInt(normalized.slice(2, 4), 16) / 255,
    b: Number.parseInt(normalized.slice(4, 6), 16) / 255
  };
}

function linearizeChannel(channel: number) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function delinearizeChannel(channel: number) {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function hexToOklab(hex: string): Oklab {
  const rgb = hexToRgb(hex);
  const r = linearizeChannel(rgb.r);
  const g = linearizeChannel(rgb.g);
  const b = linearizeChannel(rgb.b);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  return {
    l: 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot,
    a: 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot,
    b: 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot
  };
}

function oklabToHex(lab: Oklab) {
  const lRoot = lab.l + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  const mRoot = lab.l - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  const sRoot = lab.l - 0.0894841775 * lab.a - 1.291485548 * lab.b;

  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;

  const linearR = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const linearG = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const linearB = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const srgb = [linearR, linearG, linearB].map((channel) =>
    Math.round(clamp(delinearizeChannel(channel), 0, 1) * 255)
  );

  return `#${srgb.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function lerpLab(start: Oklab, end: Oklab, amount: number): Oklab {
  return {
    l: lerp(start.l, end.l, amount),
    a: lerp(start.a, end.a, amount),
    b: lerp(start.b, end.b, amount)
  };
}

function createSolvedTileColours(level: ColourFieldLevelData) {
  const topLeft = hexToOklab(level.palette.topLeft);
  const topRight = hexToOklab(level.palette.topRight);
  const bottomLeft = hexToOklab(level.palette.bottomLeft);
  const bottomRight = hexToOklab(level.palette.bottomRight);
  const colours: string[] = [];

  for (let row = 0; row < level.rows; row += 1) {
    const verticalPosition = level.rows === 1 ? 0 : row / (level.rows - 1);
    const leftEdge = lerpLab(topLeft, bottomLeft, verticalPosition);
    const rightEdge = lerpLab(topRight, bottomRight, verticalPosition);

    for (let column = 0; column < level.columns; column += 1) {
      const horizontalPosition = level.columns === 1 ? 0 : column / (level.columns - 1);
      colours.push(oklabToHex(lerpLab(leftEdge, rightEdge, horizontalPosition)));
    }
  }

  return colours;
}

function createSeedHasher(seed: string) {
  let hash = 1779033703 ^ seed.length;

  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return function nextHash() {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

function createSeededRandom(seed: string) {
  const hash = createSeedHasher(seed);
  let state = hash();

  return function nextRandom() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: string) {
  const nextRandom = createSeededRandom(seed);
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function createEmptyLevelProgress(unlocked: boolean): ColourFieldLevelProgress {
  return {
    unlocked,
    attemptCount: 0,
    bestMoves: null,
    lastMoves: null,
    currentMoves: 0,
    currentOrder: null,
    startedAt: null,
    completedAt: null
  };
}

export function getColourFieldLevelTileCount(level: ColourFieldLevelData) {
  return level.columns * level.rows;
}

export function getSolvedColourFieldOrder(level: ColourFieldLevelData) {
  return Array.from({ length: getColourFieldLevelTileCount(level) }, (_, index) => index);
}

export function getColourFieldLevel(gameData: ColourFieldGameData, levelSlug: string) {
  return gameData.levels.find((level) => level.slug === levelSlug) ?? null;
}

export function getNextColourFieldLevel(gameData: ColourFieldGameData, levelSlug: string) {
  const levelIndex = gameData.levels.findIndex((level) => level.slug === levelSlug);

  if (levelIndex < 0 || levelIndex === gameData.levels.length - 1) {
    return null;
  }

  return gameData.levels[levelIndex + 1] ?? null;
}

export function getPreviousColourFieldLevel(gameData: ColourFieldGameData, levelSlug: string) {
  const levelIndex = gameData.levels.findIndex((level) => level.slug === levelSlug);

  if (levelIndex <= 0) {
    return null;
  }

  return gameData.levels[levelIndex - 1] ?? null;
}

function normaliseLevelProgress(level: ColourFieldLevelData, progress?: Partial<ColourFieldLevelProgress>) {
  const tileCount = getColourFieldLevelTileCount(level);

  return {
    unlocked: Boolean(progress?.unlocked),
    attemptCount: typeof progress?.attemptCount === "number" ? progress.attemptCount : 0,
    bestMoves: typeof progress?.bestMoves === "number" ? progress.bestMoves : null,
    lastMoves: typeof progress?.lastMoves === "number" ? progress.lastMoves : null,
    currentMoves: typeof progress?.currentMoves === "number" ? progress.currentMoves : 0,
    currentOrder:
      Array.isArray(progress?.currentOrder) && progress.currentOrder.length === tileCount
        ? [...progress.currentOrder]
        : null,
    startedAt: typeof progress?.startedAt === "string" ? progress.startedAt : null,
    completedAt: typeof progress?.completedAt === "string" ? progress.completedAt : null
  } satisfies ColourFieldLevelProgress;
}

export function createColourFieldProgress(gameData: ColourFieldGameData): ColourFieldProgress {
  const levels = Object.fromEntries(
    gameData.levels.map((level, index) => [level.slug, createEmptyLevelProgress(index === 0)])
  );

  return {
    activeLevelSlug: gameData.levels[0]?.slug ?? null,
    completedAt: null,
    levels
  };
}

export function normaliseColourFieldProgress(
  gameData: ColourFieldGameData,
  progress?: ColourFieldProgress | null
): ColourFieldProgress {
  const fallback = createColourFieldProgress(gameData);
  const levels = Object.fromEntries(
    gameData.levels.map((level, index) => [
      level.slug,
      normaliseLevelProgress(level, progress?.levels?.[level.slug] ?? fallback.levels[level.slug] ?? createEmptyLevelProgress(index === 0))
    ])
  ) as Record<string, ColourFieldLevelProgress>;

  if (gameData.levels[0]) {
    levels[gameData.levels[0].slug].unlocked = true;
  }

  for (let index = 1; index < gameData.levels.length; index += 1) {
    const previousLevel = gameData.levels[index - 1];
    const currentLevel = gameData.levels[index];

    if (levels[previousLevel.slug].completedAt) {
      levels[currentLevel.slug].unlocked = true;
    }
  }

  const fallbackActiveLevel =
    gameData.levels.find((level) => levels[level.slug].unlocked && !levels[level.slug].completedAt) ??
    gameData.levels.find((level) => levels[level.slug].unlocked) ??
    gameData.levels[0] ??
    null;

  const activeLevelSlug =
    typeof progress?.activeLevelSlug === "string" && levels[progress.activeLevelSlug]?.unlocked
      ? progress.activeLevelSlug
      : fallbackActiveLevel?.slug ?? null;

  const completedAt =
    gameData.levels.length > 0 && gameData.levels.every((level) => Boolean(levels[level.slug].completedAt))
      ? progress?.completedAt ?? levels[gameData.levels[gameData.levels.length - 1].slug].completedAt
      : null;

  return {
    activeLevelSlug,
    completedAt,
    levels
  };
}

export function isColourFieldLevelSolved(order: number[]) {
  return order.every((tileId, index) => tileId === index);
}

function createScrambledOrder(level: ColourFieldLevelData, seed: string) {
  const lockedIndexes = new Set(level.fixedTileIndexes);
  const solvedOrder = getSolvedColourFieldOrder(level);
  const movableIndexes = solvedOrder.filter((index) => !lockedIndexes.has(index));

  if (movableIndexes.length < 2) {
    return solvedOrder;
  }

  let shuffledTiles = shuffle(movableIndexes, seed);

  if (shuffledTiles.every((tileId, index) => tileId === movableIndexes[index])) {
    shuffledTiles = [...shuffledTiles.slice(1), shuffledTiles[0]];
  }

  const order = [...solvedOrder];
  movableIndexes.forEach((position, movableIndex) => {
    order[position] = shuffledTiles[movableIndex];
  });

  return order;
}

function cloneProgress(progress: ColourFieldProgress): ColourFieldProgress {
  return {
    activeLevelSlug: progress.activeLevelSlug,
    completedAt: progress.completedAt,
    levels: Object.fromEntries(
      Object.entries(progress.levels).map(([slug, level]) => [
        slug,
        {
          ...level,
          currentOrder: level.currentOrder ? [...level.currentOrder] : null
        }
      ])
    )
  };
}

export function readColourFieldStatusSummary(
  gameData: ColourFieldGameData,
  progress?: ColourFieldProgress | null
) {
  const normalised = normaliseColourFieldProgress(gameData, progress);

  if (gameData.levels.length > 0 && gameData.levels.every((level) => Boolean(normalised.levels[level.slug].completedAt))) {
    return "completed" as const;
  }

  const hasAnyProgress = gameData.levels.some((level) => {
    const levelProgress = normalised.levels[level.slug];

    return Boolean(levelProgress.completedAt) || levelProgress.currentMoves > 0 || Boolean(levelProgress.startedAt);
  });

  return hasAnyProgress ? ("in-progress" as const) : ("none" as const);
}

export function getCompletedColourFieldCount(gameData: ColourFieldGameData, progress?: ColourFieldProgress | null) {
  const normalised = normaliseColourFieldProgress(gameData, progress);

  return gameData.levels.filter((level) => Boolean(normalised.levels[level.slug].completedAt)).length;
}

export function getFirstUnlockedColourFieldLevel(
  gameData: ColourFieldGameData,
  progress?: ColourFieldProgress | null
) {
  const normalised = normaliseColourFieldProgress(gameData, progress);

  return (
    gameData.levels.find((level) => normalised.levels[level.slug].unlocked && !normalised.levels[level.slug].completedAt) ??
    gameData.levels.find((level) => normalised.levels[level.slug].unlocked) ??
    null
  );
}

export function getColourFieldLevelProgress(
  gameData: ColourFieldGameData,
  progress: ColourFieldProgress,
  levelSlug: string
) {
  const normalised = normaliseColourFieldProgress(gameData, progress);
  return normalised.levels[levelSlug] ?? null;
}

export function getColourFieldLevelBoard(level: ColourFieldLevelData, order?: number[] | null): ColourFieldBoardTile[] {
  const solvedColours = createSolvedTileColours(level);
  const solvedOrder = getSolvedColourFieldOrder(level);
  const activeOrder =
    Array.isArray(order) && order.length === solvedOrder.length ? order : solvedOrder;
  const lockedIndexes = new Set(level.fixedTileIndexes);

  return activeOrder.map((tileId, position) => ({
    position,
    row: Math.floor(position / level.columns),
    column: position % level.columns,
    tileId,
    color: solvedColours[tileId],
    locked: lockedIndexes.has(position),
    correct: tileId === position
  }));
}

export function startColourFieldLevel({
  gameData,
  progress,
  levelSlug,
  now,
  restart = false
}: {
  gameData: ColourFieldGameData;
  progress: ColourFieldProgress;
  levelSlug: string;
  now: string;
  restart?: boolean;
}) {
  const level = getColourFieldLevel(gameData, levelSlug);

  if (!level) {
    return progress;
  }

  const normalised = normaliseColourFieldProgress(gameData, progress);
  const levelProgress = normalised.levels[levelSlug];

  if (!levelProgress?.unlocked) {
    return normalised;
  }

  if (!restart && levelProgress.currentOrder) {
    return {
      ...normalised,
      activeLevelSlug: levelSlug
    };
  }

  const nextAttemptCount = levelProgress.attemptCount + 1;
  const nextProgress = cloneProgress(normalised);
  nextProgress.activeLevelSlug = levelSlug;
  nextProgress.levels[levelSlug] = {
    ...nextProgress.levels[levelSlug],
    attemptCount: nextAttemptCount,
    currentMoves: 0,
    currentOrder: createScrambledOrder(level, `${level.seed}:${nextAttemptCount}`),
    startedAt: now
  };

  return nextProgress;
}

export function swapColourFieldTiles({
  gameData,
  progress,
  levelSlug,
  sourceIndex,
  targetIndex,
  now
}: {
  gameData: ColourFieldGameData;
  progress: ColourFieldProgress;
  levelSlug: string;
  sourceIndex: number;
  targetIndex: number;
  now: string;
}) {
  const level = getColourFieldLevel(gameData, levelSlug);

  if (!level || sourceIndex === targetIndex) {
    return {
      progress,
      solved: false,
      newlyCompleted: false,
      moves: 0
    };
  }

  const levelProgress = getColourFieldLevelProgress(gameData, progress, levelSlug);

  if (
    !levelProgress?.currentOrder ||
    level.fixedTileIndexes.includes(sourceIndex) ||
    level.fixedTileIndexes.includes(targetIndex)
  ) {
    return {
      progress,
      solved: false,
      newlyCompleted: false,
      moves: levelProgress?.currentMoves ?? 0
    };
  }

  const nextProgress = cloneProgress(normaliseColourFieldProgress(gameData, progress));
  const currentLevelProgress = nextProgress.levels[levelSlug];
  const nextOrder = [...(currentLevelProgress.currentOrder ?? getSolvedColourFieldOrder(level))];
  [nextOrder[sourceIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[sourceIndex]];

  const nextMoves = currentLevelProgress.currentMoves + 1;
  const solved = isColourFieldLevelSolved(nextOrder);
  const newlyCompleted = !currentLevelProgress.completedAt && solved;

  nextProgress.activeLevelSlug = levelSlug;
  nextProgress.levels[levelSlug] = {
    ...currentLevelProgress,
    currentOrder: nextOrder,
    currentMoves: nextMoves,
    startedAt: currentLevelProgress.startedAt ?? now,
    lastMoves: solved ? nextMoves : currentLevelProgress.lastMoves,
    bestMoves: solved
      ? currentLevelProgress.bestMoves === null
        ? nextMoves
        : Math.min(currentLevelProgress.bestMoves, nextMoves)
      : currentLevelProgress.bestMoves,
    completedAt: solved ? currentLevelProgress.completedAt ?? now : currentLevelProgress.completedAt
  };

  if (solved) {
    const nextLevel = getNextColourFieldLevel(gameData, levelSlug);

    if (nextLevel) {
      nextProgress.levels[nextLevel.slug] = {
        ...nextProgress.levels[nextLevel.slug],
        unlocked: true
      };
    }

    if (gameData.levels.every((gameLevel) => Boolean(nextProgress.levels[gameLevel.slug].completedAt))) {
      nextProgress.completedAt = nextProgress.completedAt ?? now;
    }
  }

  return {
    progress: nextProgress,
    solved,
    newlyCompleted,
    moves: nextMoves
  };
}
