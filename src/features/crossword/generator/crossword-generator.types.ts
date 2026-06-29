import type { ImportIssue } from "@/features/content/import.types";
import type { CrosswordCompiledData, CrosswordDirection } from "@/features/crossword/game/crossword-game.types";
import type { CrosswordCompleteSourceRow } from "@/features/crossword/source/crossword-source.types";

export type CrosswordGeneratorInput = {
  rows: CrosswordCompleteSourceRow[];
  seed: string;
  completion: CrosswordCompiledData["completion"];
  layout?: {
    minRows?: number;
    maxRows?: number;
    minColumns?: number;
    maxColumns?: number;
    targetRows?: number;
    targetColumns?: number;
  };
};

export type CrosswordUnplacedEntry = {
  id: string;
  clue: string;
  answer: string;
  sourceRowNumber: number;
  reason: string;
};

export type CrosswordCompilationResult = {
  compiledData: CrosswordCompiledData | null;
  issues: ImportIssue[];
  placedRows: CrosswordCompleteSourceRow[];
  unplacedRows: CrosswordUnplacedEntry[];
};

export type InternalPlacedEntry = {
  id: string;
  clue: string;
  answer: string;
  displayAnswer: string;
  category?: string;
  sourceRowNumber: number;
  row: number;
  column: number;
  direction: CrosswordDirection;
};
