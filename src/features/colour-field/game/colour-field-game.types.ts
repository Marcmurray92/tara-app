export type ColourFieldPaletteCorners = {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
};

export type ColourFieldLevelData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  columns: number;
  rows: number;
  fixedTileIndexes: number[];
  palette: ColourFieldPaletteCorners;
  previewDurationMs: number;
  seed: string;
};

export type ColourFieldGameData = {
  schemaVersion: number;
  introLine: string;
  completionLines: string[];
  levels: ColourFieldLevelData[];
};

export type ColourFieldLevelProgress = {
  unlocked: boolean;
  attemptCount: number;
  bestMoves: number | null;
  lastMoves: number | null;
  currentMoves: number;
  currentOrder: number[] | null;
  startedAt: string | null;
  completedAt: string | null;
};

export type ColourFieldProgress = {
  activeLevelSlug: string | null;
  completedAt: string | null;
  levels: Record<string, ColourFieldLevelProgress>;
};

export type ColourFieldBoardTile = {
  position: number;
  row: number;
  column: number;
  tileId: number;
  color: string;
  locked: boolean;
  correct: boolean;
};

export type SeededColourFieldSummary = {
  slug: string;
  href: string;
  title: string;
  description: string;
  contentVersion: number;
  levelCount: number;
};
