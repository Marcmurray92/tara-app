import { resolveHeaders } from "@/features/content/import-headers";
import type { ImportIssue } from "@/features/content/import.types";
import { parseDelimitedTable } from "@/lib/csv/parse-csv";
import { trimToUndefined } from "@/lib/utils/strings";

export type ParsedTabularRow = {
  sourceRowNumber: number;
  values: Record<string, string>;
};

export type ParsedTabularData = {
  delimiter: "," | "\t";
  detectedHeaders: string[];
  unknownHeaders: string[];
  ignoredBlankRows: number;
  rows: ParsedTabularRow[];
  issues: ImportIssue[];
};

export function parseTabularData({
  rawText,
  requiredHeaders,
  optionalHeaders = []
}: {
  rawText: string;
  requiredHeaders: string[];
  optionalHeaders?: string[];
}): ParsedTabularData {
  const parsed = parseDelimitedTable(rawText);
  const detectedHeaders = parsed.rows[0]?.map((header) => header.trim()) ?? [];
  const headerResolution = resolveHeaders({
    detectedHeaders,
    requiredHeaders,
    optionalHeaders
  });

  const issues: ImportIssue[] = [
    ...headerResolution.issues,
    ...parsed.errors.map((error) => ({
      rowNumber: error.row ? error.row + 1 : undefined,
      severity: "error" as const,
      code: "parse_error",
      message: error.message
    }))
  ];

  const rows: ParsedTabularRow[] = [];
  let ignoredBlankRows = 0;
  const knownHeaders = [...requiredHeaders, ...optionalHeaders];

  for (const [index, cells] of parsed.rows.slice(1).entries()) {
    const sourceRowNumber = index + 2;
    const values = Object.fromEntries(
      knownHeaders.map((header) => {
        const requiredIndex = headerResolution.requiredMap.get(header);
        const optionalIndex = headerResolution.optionalMap.get(header);
        const cellIndex = requiredIndex ?? optionalIndex;
        const raw = cellIndex === undefined ? "" : cells[cellIndex] ?? "";
        const cleaned = raw.replace(/\u00A0/g, " ").trim();

        return [header, cleaned];
      })
    );

    const isBlank = Object.values(values).every((value) => trimToUndefined(value) === undefined);

    if (isBlank) {
      ignoredBlankRows += 1;
      continue;
    }

    rows.push({
      sourceRowNumber,
      values
    });
  }

  return {
    delimiter: parsed.delimiter,
    detectedHeaders,
    unknownHeaders: headerResolution.unknownHeaders,
    ignoredBlankRows,
    rows,
    issues
  };
}

