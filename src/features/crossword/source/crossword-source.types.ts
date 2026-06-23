import type { ImportIssue, RowStatus } from "@/features/content/import.types";

export type CrosswordSourceRow = {
  id: string;
  sourceRowNumber: number;
  clue: string;
  answer: string;
  category?: string;
  gridAnswer?: string;
  status: RowStatus;
  issues: ImportIssue[];
};

export type CrosswordCompleteSourceRow = CrosswordSourceRow & {
  status: "complete";
  gridAnswer: string;
};

