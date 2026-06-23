import type { ImportIssue, RowStatus } from "@/features/content/import.types";

export type GuessingSourceRow = {
  id: string;
  sourceRowNumber: number;
  rightAnswer: string;
  answer2: string;
  answer3: string;
  answer4: string;
  letterboxdReviews: string;
  status: RowStatus;
  issues: ImportIssue[];
};

