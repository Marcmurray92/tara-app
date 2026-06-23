export type ImportIssue = {
  rowNumber?: number;
  column?: string;
  severity: "warning" | "error";
  code: string;
  message: string;
};

export type RowStatus = "complete" | "incomplete" | "invalid";

export type RowIssueCarrier = {
  issues: ImportIssue[];
  status: RowStatus;
};

export type ImportResult<T> = {
  rows: T[];
  ignoredBlankRows: number;
  issues: ImportIssue[];
  detectedHeaders: string[];
  unknownHeaders: string[];
};

