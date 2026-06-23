import Papa from "papaparse";

export function parseTsv(text: string) {
  return Papa.parse<string[]>(text, {
    delimiter: "\t",
    skipEmptyLines: false
  });
}

