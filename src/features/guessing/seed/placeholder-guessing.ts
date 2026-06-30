import type {
  GuessingChoice,
  GuessingDifficulty,
  GuessingGameData,
  GuessingRound
} from "@/features/guessing/game/guessing-game.types";
import taraReviewQuotesData from "../../../../data/letterboxd/processed/tara-review-quotes.json";

export type SeededGuessingContent = {
  slug: string;
  href: string;
  title: string;
  subtitle?: string | null;
  description: string;
  contentVersion: number;
  gameData: GuessingGameData;
};

type RoundBlueprint = {
  id: string;
  difficulty: GuessingDifficulty;
  reviewSlug: string;
  correctChoiceId: string;
  choices: [GuessingChoice, GuessingChoice, GuessingChoice, GuessingChoice];
  celebrationQuote?: string | null;
};

export const placeholderGuessingSlug = "tara-movie-guessing";
export const placeholderGuessingTitle = "Review Roulette";
export const placeholderGuessingSubtitle = "Three review rounds. Two mistakes each. Pure cinema pressure.";
export const placeholderGuessingDescription =
  "Read the Letterboxd screenshot, clock the right film, and clear Easy, Medium, and Hard before the review fully drags you.";
export const placeholderGuessingContentVersion = 8;

const MOVIE_REVIEW_GUESS_ASSET_ROOT = "/images/games/movie-review-guess";

const REVIEW_IMAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  "american-beauty": { width: 848, height: 236 },
  arrival: { width: 1380, height: 726 },
  "dial-m-for-murder": { width: 1418, height: 404 },
  "good-boys": { width: 1410, height: 304 },
  "harold-and-maude": { width: 1240, height: 264 },
  "inside-the-manosphere": { width: 1328, height: 234 },
  "it-ends": { width: 840, height: 224 },
  "last-king-of-scotland": { width: 766, height: 250 },
  "marty-supreme": { width: 1048, height: 260 },
  "mean-girls": { width: 920, height: 284 },
  "spring-breakers": { width: 756, height: 306 },
  "the-bride": { width: 1018, height: 250 },
  "the-moment": { width: 1446, height: 364 },
  weapons: { width: 1382, height: 232 },
  "wuthering-heights": { width: 904, height: 312 }
};

const POSTER_SLUG_ALIASES: Record<string, string> = {
  "inside-the-manosphere": "louis-theroux-inside-the-manosphere",
  "it-ends": "it-ends-with-us",
  "pride-and-prejudice": "pride-prejudice"
};

const quoteBySlug = new Map(
  taraReviewQuotesData.quotes.map((quote) => [quote.slug, quote.celebrationQuote])
);

function getCelebrationQuote(slug: string) {
  return quoteBySlug.get(slug) ?? null;
}

function resolvePosterSlug(slug: string) {
  return POSTER_SLUG_ALIASES[slug] ?? slug;
}

function getReviewImage(slug: string, label: string) {
  const dimensions = REVIEW_IMAGE_DIMENSIONS[slug] ?? { width: 1200, height: 320 };

  return {
    src: `${MOVIE_REVIEW_GUESS_ASSET_ROOT}/reviews/${slug}.png`,
    width: dimensions.width,
    height: dimensions.height,
    alt: `Letterboxd review screenshot for ${label}`
  };
}

function getPosterImage(slug: string, label: string) {
  const posterSlug = resolvePosterSlug(slug);

  return {
    src: `${MOVIE_REVIEW_GUESS_ASSET_ROOT}/posters/${posterSlug}.png`,
    width: 600,
    height: 900,
    alt: `${label} poster`
  };
}

function toChoice(id: string, label: string, year: number): GuessingChoice {
  return {
    id,
    label,
    year,
    posterImage: getPosterImage(id, label)
  };
}

function makeRound(round: RoundBlueprint): GuessingRound {
  const correctChoice = round.choices.find((choice) => choice.id === round.correctChoiceId) ?? round.choices[0];
  const correctLabel = correctChoice?.label ?? round.correctChoiceId;

  return {
    id: round.id,
    difficulty: round.difficulty,
    reviewImage: getReviewImage(round.reviewSlug, correctLabel),
    choices: round.choices,
    correctChoiceId: round.correctChoiceId,
    celebrationQuote: round.celebrationQuote ?? getCelebrationQuote(round.correctChoiceId)
  };
}

function makeGameData(rounds: [RoundBlueprint, RoundBlueprint, RoundBlueprint]): GuessingGameData {
  return {
    schemaVersion: 2,
    rounds: rounds.map((round) => makeRound(round)) as [GuessingRound, GuessingRound, GuessingRound]
  };
}

const SEEDED_GUESSING_BLUEPRINTS: Array<{
  slug: string;
  rounds: [RoundBlueprint, RoundBlueprint, RoundBlueprint];
}> = [
  {
    slug: placeholderGuessingSlug,
    rounds: [
      {
        id: "easy-mean-girls",
        difficulty: "Easy",
        reviewSlug: "mean-girls",
        correctChoiceId: "mean-girls",
        choices: [
          toChoice("mean-girls", "Mean Girls", 2004),
          toChoice("heathers", "Heathers", 1988),
          toChoice("clueless", "Clueless", 1995),
          toChoice("easy-a", "Easy A", 2010)
        ]
      },
      {
        id: "medium-arrival",
        difficulty: "Medium",
        reviewSlug: "arrival",
        correctChoiceId: "arrival",
        choices: [
          toChoice("arrival", "Arrival", 2016),
          toChoice("contact", "Contact", 1997),
          toChoice("interstellar", "Interstellar", 2014),
          toChoice("annihilation", "Annihilation", 2018)
        ]
      },
      {
        id: "hard-american-beauty",
        difficulty: "Hard",
        reviewSlug: "american-beauty",
        correctChoiceId: "american-beauty",
        choices: [
          toChoice("american-beauty", "American Beauty", 1999),
          toChoice("the-virgin-suicides", "The Virgin Suicides", 1999),
          toChoice("revolutionary-road", "Revolutionary Road", 2008),
          toChoice("little-children", "Little Children", 2006)
        ]
      }
    ]
  },
  {
    slug: `${placeholderGuessingSlug}-2`,
    rounds: [
      {
        id: "easy-the-moment",
        difficulty: "Easy",
        reviewSlug: "the-moment",
        correctChoiceId: "the-moment",
        choices: [
          toChoice("the-moment", "The Moment", 2026),
          toChoice("vox-lux", "Vox Lux", 2018),
          toChoice("a-star-is-born", "A Star Is Born", 2018),
          toChoice("popstar-never-stop-never-stopping", "Popstar: Never Stop Never Stopping", 2016)
        ],
        celebrationQuote: "Go piss girl :)  New album isnt meant 2 be gr8 :-("
      },
      {
        id: "medium-good-boys",
        difficulty: "Medium",
        reviewSlug: "good-boys",
        correctChoiceId: "good-boys",
        choices: [
          toChoice("good-boys", "Good Boys", 2019),
          toChoice("superbad", "Superbad", 2007),
          toChoice("booksmart", "Booksmart", 2019),
          toChoice("blockers", "Blockers", 2018)
        ],
        celebrationQuote: "You ate gurl! That swing is for sexing. People do sex on it."
      },
      {
        id: "hard-spring-breakers",
        difficulty: "Hard",
        reviewSlug: "spring-breakers",
        correctChoiceId: "spring-breakers",
        choices: [
          toChoice("spring-breakers", "Spring Breakers", 2012),
          toChoice("the-bling-ring", "The Bling Ring", 2013),
          toChoice("project-x", "Project X", 2012),
          toChoice("the-beach-bum", "The Beach Bum", 2019)
        ],
        celebrationQuote: "Yep, Such a shite movie."
      }
    ]
  },
  {
    slug: `${placeholderGuessingSlug}-3`,
    rounds: [
      {
        id: "easy-last-king-of-scotland",
        difficulty: "Easy",
        reviewSlug: "last-king-of-scotland",
        correctChoiceId: "last-king-of-scotland",
        choices: [
          toChoice("last-king-of-scotland", "The Last King of Scotland", 2006),
          toChoice("hotel-rwanda", "Hotel Rwanda", 2004),
          toChoice("blood-diamond", "Blood Diamond", 2006),
          toChoice("the-constant-gardener", "The Constant Gardener", 2005)
        ],
        celebrationQuote: "Slay! Remember his big fart lol"
      },
      {
        id: "medium-harold-and-maude",
        difficulty: "Medium",
        reviewSlug: "harold-and-maude",
        correctChoiceId: "harold-and-maude",
        choices: [
          toChoice("harold-and-maude", "Harold and Maude", 1971),
          toChoice("the-graduate", "The Graduate", 1967),
          toChoice("rushmore", "Rushmore", 1998),
          toChoice("being-there", "Being There", 1979)
        ],
        celebrationQuote: "No jokes I can think of now cos im baked but well done I love you <3"
      },
      {
        id: "hard-it-ends",
        difficulty: "Hard",
        reviewSlug: "it-ends",
        correctChoiceId: "it-ends",
        choices: [
          toChoice("it-ends", "It Ends", 2025),
          toChoice("it-follows", "It Follows", 2014),
          toChoice("it-comes-at-night", "It Comes at Night", 2017),
          toChoice("the-endless", "The Endless", 2017)
        ],
        celebrationQuote: "Correct. The title says it ends. The road says absolutely not."
      }
    ]
  },
  {
    slug: `${placeholderGuessingSlug}-4`,
    rounds: [
      {
        id: "easy-marty-supreme",
        difficulty: "Easy",
        reviewSlug: "marty-supreme",
        correctChoiceId: "marty-supreme",
        choices: [
          toChoice("marty-supreme", "Marty Supreme", 2025),
          toChoice("challengers", "Challengers", 2024),
          toChoice("uncut-gems", "Uncut Gems", 2019),
          toChoice("balls-of-fury", "Balls of Fury", 2007)
        ],
        celebrationQuote: "Slay! I'm Hitler's worst nightmare."
      },
      {
        id: "medium-inside-the-manosphere",
        difficulty: "Medium",
        reviewSlug: "inside-the-manosphere",
        correctChoiceId: "inside-the-manosphere",
        choices: [
          toChoice("inside-the-manosphere", "Inside the Manosphere", 2026),
          toChoice("the-red-pill", "The Red Pill", 2016),
          toChoice("the-tinder-swindler", "The Tinder Swindler", 2022),
          toChoice("the-social-dilemma", "The Social Dilemma", 2020)
        ],
        celebrationQuote: "MEN."
      },
      {
        id: "hard-the-bride",
        difficulty: "Hard",
        reviewSlug: "the-bride",
        correctChoiceId: "the-bride",
        choices: [
          toChoice("the-bride", "The Bride", 2026),
          toChoice("poor-things", "Poor Things", 2023),
          toChoice("bride-of-frankenstein", "Bride of Frankenstein", 1935),
          toChoice("lisa-frankenstein", "Lisa Frankenstein", 2024)
        ],
        celebrationQuote: "Correct. I havent seen this."
      }
    ]
  },
  {
    slug: `${placeholderGuessingSlug}-5`,
    rounds: [
      {
        id: "easy-wuthering-heights",
        difficulty: "Easy",
        reviewSlug: "wuthering-heights",
        correctChoiceId: "wuthering-heights",
        choices: [
          toChoice("wuthering-heights", "Wuthering Heights", 2026),
          toChoice("jane-eyre", "Jane Eyre", 2011),
          toChoice("pride-and-prejudice", "Pride & Prejudice", 2005),
          toChoice("saltburn", "Saltburn", 2023)
        ],
        celebrationQuote: "Slay! Fanny wuthers? Fluttering heights?"
      },
      {
        id: "medium-weapons",
        difficulty: "Medium",
        reviewSlug: "weapons",
        correctChoiceId: "weapons",
        choices: [
          toChoice("weapons", "Weapons", 2025),
          toChoice("barbarian", "Barbarian", 2022),
          toChoice("longlegs", "Longlegs", 2024),
          toChoice("prisoners", "Prisoners", 2013)
        ],
        celebrationQuote: "You ate gurl! Naruto run."
      },
      {
        id: "hard-dial-m-for-murder",
        difficulty: "Hard",
        reviewSlug: "dial-m-for-murder",
        correctChoiceId: "dial-m-for-murder",
        choices: [
          toChoice("dial-m-for-murder", "Dial M for Murder", 1954),
          toChoice("rear-window", "Rear Window", 1954),
          toChoice("rope", "Rope", 1948),
          toChoice("strangers-on-a-train", "Strangers on a Train", 1951)
        ],
        celebrationQuote: "You ate gurl! Very good."
      }
    ]
  }
];

export const seededGuessingGames: SeededGuessingContent[] = SEEDED_GUESSING_BLUEPRINTS.map((game, index) => ({
  slug: game.slug,
  href: `/games/guessing/${game.slug}`,
  title: `${placeholderGuessingTitle} ${index + 1}`,
  subtitle: placeholderGuessingSubtitle,
  description: placeholderGuessingDescription,
  contentVersion: placeholderGuessingContentVersion,
  gameData: makeGameData(game.rounds)
}));

const seededGuessingMap = new Map(seededGuessingGames.map((game) => [game.slug, game]));

export const placeholderGuessingGameData = seededGuessingGames[0]?.gameData ?? makeGameData(SEEDED_GUESSING_BLUEPRINTS[0].rounds);

export function getSeededGuessingBySlug(slug: string) {
  return seededGuessingMap.get(slug) ?? null;
}

export function getDefaultSeededGuessingGame() {
  const game = seededGuessingGames[0];

  if (!game) {
    throw new Error("At least one seeded Review Roulette game is required.");
  }

  return game;
}

export function listSeededGuessingSummaries() {
  return seededGuessingGames.map((game) => ({
    slug: game.slug,
    href: game.href,
    title: game.title,
    subtitle: game.subtitle,
    description: game.description,
    contentVersion: game.contentVersion,
    gameData: game.gameData
  }));
}
