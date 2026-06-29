const BIRTHDAY_DATE_LABELS = [
  "June 30th",
  "July 1st",
  "July 2nd",
  "July 3rd",
  "July 4th",
  "July 5th",
  "July 6th",
  "July 7th",
  "July 8th",
  "July 9th",
  "July 10th",
  "July 11th",
  "July 12th",
  "July 13th",
  "July 14th",
  "July 15th",
  "July 16th",
  "July 17th",
  "July 18th",
  "July 19th",
  "July 20th"
] as const;

export function getBirthdayDateLabel(index: number) {
  return BIRTHDAY_DATE_LABELS[index] ?? `Day ${index + 1}`;
}

export function getBirthdayDateLabels(count: number) {
  return Array.from({ length: count }, (_, index) => getBirthdayDateLabel(index));
}
