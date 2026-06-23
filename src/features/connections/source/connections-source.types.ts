import type { ImportIssue, RowStatus } from "@/features/content/import.types";

export type ConnectionsSourceRow = {
  id: string;
  sourceRowNumber: number;
  category: string;
  movies: [string, string, string, string] | string[];
  status: RowStatus;
  issues: ImportIssue[];
};

