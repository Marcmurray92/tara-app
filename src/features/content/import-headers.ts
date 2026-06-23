import type { ImportIssue } from "@/features/content/import.types";
import { normalizeLooseText, stripBom } from "@/lib/utils/strings";

export function normalizeHeader(header: string) {
  return normalizeLooseText(stripBom(header));
}

export function buildHeaderMap(headers: string[]) {
  const issues: ImportIssue[] = [];
  const normalizedToIndex = new Map<string, number>();

  headers.forEach((header, index) => {
    const normalized = normalizeHeader(header);

    if (normalizedToIndex.has(normalized)) {
      issues.push({
        severity: "error",
        code: "duplicate_header",
        column: header,
        message: `Duplicate heading detected: "${header}".`
      });
      return;
    }

    normalizedToIndex.set(normalized, index);
  });

  return { normalizedToIndex, issues };
}

export function resolveHeaders({
  detectedHeaders,
  requiredHeaders,
  optionalHeaders = []
}: {
  detectedHeaders: string[];
  requiredHeaders: string[];
  optionalHeaders?: string[];
}) {
  const { normalizedToIndex, issues: duplicateIssues } = buildHeaderMap(detectedHeaders);
  const issues = [...duplicateIssues];
  const requiredMap = new Map<string, number>();
  const optionalMap = new Map<string, number>();

  for (const header of requiredHeaders) {
    const normalized = normalizeHeader(header);
    const index = normalizedToIndex.get(normalized);

    if (index === undefined) {
      issues.push({
        severity: "error",
        code: "missing_required_header",
        column: header,
        message: `Missing required heading "${header}".`
      });
      continue;
    }

    requiredMap.set(header, index);
  }

  for (const header of optionalHeaders) {
    const normalized = normalizeHeader(header);
    const index = normalizedToIndex.get(normalized);
    if (index !== undefined) {
      optionalMap.set(header, index);
    }
  }

  const allowed = new Set([...requiredHeaders, ...optionalHeaders].map(normalizeHeader));
  const unknownHeaders = detectedHeaders.filter((header) => !allowed.has(normalizeHeader(header)));

  return {
    requiredMap,
    optionalMap,
    unknownHeaders,
    issues
  };
}

