export type CrosswordDirection = "across" | "down";

export type CrosswordCompiledEntry = {
  id: string;
  sourceRowNumber?: number;
  number: number;
  direction: CrosswordDirection;
  clue: string;
  answer: string;
  displayAnswer: string;
  category?: string;
  startRow: number;
  startColumn: number;
  length: number;
};

export type CrosswordCompiledCell = {
  row: number;
  column: number;
  solution: string | null;
  number?: number;
  acrossEntryId?: string;
  downEntryId?: string;
  circle?: boolean;
};

export type CrosswordGenerationMetadata = {
  seed: string;
  attemptedEntryIds: string[];
  placedEntryIds: string[];
  unplacedEntryIds: string[];
  generatedAt: string;
  algorithmVersion: number;
};

export type CrosswordCompiledData = {
  schemaVersion: 1;
  rows: number;
  columns: number;
  cells: CrosswordCompiledCell[][];
  entries: CrosswordCompiledEntry[];
  generation: CrosswordGenerationMetadata;
  completion: {
    title: string;
    message: string;
    actionLabel?: string;
    actionHref?: string;
  };
};

export type CrosswordPlayerCell = {
  value: string;
  checkedIncorrect: boolean;
  revealed: boolean;
};

export type CrosswordSelection = {
  row: number;
  column: number;
  direction: CrosswordDirection;
};

export type CrosswordProgress = {
  schemaVersion: 1;
  cells: CrosswordPlayerCell[][];
  selection: CrosswordSelection | null;
  startedAt: string | null;
  elapsedMilliseconds: number;
  completedAt: string | null;
};

