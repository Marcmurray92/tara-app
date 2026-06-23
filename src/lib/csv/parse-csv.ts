import Papa from "papaparse";

const WINDOWS_LINE_ENDINGS = /\r\n/g;
const OLD_MAC_LINE_ENDINGS = /\r/g;

export type ParsedDelimitedTable = {
  delimiter: "," | "\t";
  rows: string[][];
  errors: {
    row?: number;
    message: string;
  }[];
};

function detectDelimiter(text: string): "," | "\t" {
  const lines = text.split("\n").filter((line) => line.trim().length > 0).slice(0, 5);
  const tabScore = lines.reduce((total, line) => total + (line.match(/\t/g)?.length ?? 0), 0);
  const commaScore = lines.reduce((total, line) => total + (line.match(/,/g)?.length ?? 0), 0);

  return tabScore > commaScore ? "\t" : ",";
}

export function parseDelimitedTable(text: string): ParsedDelimitedTable {
  const sanitized = text.replace(WINDOWS_LINE_ENDINGS, "\n").replace(OLD_MAC_LINE_ENDINGS, "\n");
  const delimiter = detectDelimiter(sanitized);
  const parsed = Papa.parse<string[]>(sanitized, {
    delimiter,
    skipEmptyLines: false
  });

  return {
    delimiter,
    rows: parsed.data.map((row: string[]) => row.map((value: string) => value ?? "")),
    errors: parsed.errors.map((error) => ({
      row: error.row,
      message: error.message
    }))
  };
}
