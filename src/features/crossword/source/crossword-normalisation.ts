const SAFE_REMOVALS = /[\s.'’`!?.,:;"/()-]+/g;

export type NormalizedGridAnswer =
  | {
      ok: true;
      value: string;
    }
  | {
      ok: false;
      reason: string;
    };

export function normalizeGridAnswer(answer: string): NormalizedGridAnswer {
  const cleaned = answer
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(SAFE_REMOVALS, "")
    .toUpperCase();

  if (cleaned.includes("&")) {
    return {
      ok: false,
      reason: "Ampersands are not converted automatically. Supply an explicit Grid Answer override instead."
    };
  }

  if (!/^[A-Z0-9]*$/.test(cleaned)) {
    return {
      ok: false,
      reason: "The answer contains symbols that cannot be safely converted into a crossword grid answer."
    };
  }

  if (cleaned.length < 2) {
    return {
      ok: false,
      reason: "Grid answers must contain at least two playable characters."
    };
  }

  return {
    ok: true,
    value: cleaned
  };
}
