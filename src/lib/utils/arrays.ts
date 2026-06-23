export function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = getKey(item);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

export function partition<T>(items: T[], predicate: (item: T) => boolean) {
  const matches: T[] = [];
  const rest: T[] = [];

  for (const item of items) {
    if (predicate(item)) {
      matches.push(item);
    } else {
      rest.push(item);
    }
  }

  return [matches, rest] as const;
}

