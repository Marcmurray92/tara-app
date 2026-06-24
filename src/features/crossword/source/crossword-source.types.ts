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

export type CrosswordSourceImportMetadata = {
  detectedHeaders: string[];
  unknownHeaders: string[];
  ignoredBlankRows: number;
};

export type CrosswordSourceAuthoringState = {
  selectedRowIds: string[];
  seed: string;
  completion: {
    title: string;
    message: string;
    actionLabel?: string;
    actionHref?: string;
  };
  importMetadata?: CrosswordSourceImportMetadata;
};

export type CrosswordSourceDataEnvelope = {
  schemaVersion: 1;
  rows: CrosswordSourceRow[];
  authoring?: CrosswordSourceAuthoringState;
};
