type CelebrationTone = "correct" | "group" | "complete" | "perfect" | "final";

const CELEBRATION_POOLS: Record<CelebrationTone, string[]> = {
  correct: [
    "Ate that",
    "Correct and gorgeous",
    "You cooked",
    "That answer was giving",
    "Big brain moment",
    "Cinema, actually"
  ],
  group: [
    "No crumbs",
    "That was clean",
    "She understood the assignment",
    "Serving knowledge",
    "Actually iconic"
  ],
  complete: [
    "Slay queen",
    "You are serving",
    "Massive slay",
    "Mother behaviour",
    "Main character behaviour",
    "The crown remains secure",
    "Tara stays winning"
  ],
  perfect: [
    "You left no crumbs",
    "Elite behaviour",
    "The allegations are true: you're brilliant",
    "Another win for women",
    "Unreasonably talented",
    "Not you absolutely smashing it"
  ],
  final: [
    "Another win for women",
    "The allegations are true: you're brilliant",
    "Not you absolutely smashing it",
    "The crown remains secure"
  ]
};

export function getCelebrationCopy(tone: CelebrationTone, seed = 0) {
  const pool = CELEBRATION_POOLS[tone];
  return pool[Math.abs(seed) % pool.length];
}
