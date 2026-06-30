import type { WhoLikedItBetterGameData } from "@/features/who-liked-it-better/game/who-liked-it-better-game.types";
import whoLikedItBetterCandidates from "../../../../data/letterboxd/processed/who-liked-it-better-candidates.json";

type RawCandidate = {
  id: string;
  movieTitle: string;
  movieSlug: string;
  year: number | null;
  celebrityName: string;
  celebrityRating: number;
  celebrityRatingSource: string | null;
  celebrityRatingConfidence: "high" | "medium" | "low";
  taraRating: number | null;
  sourceImagePath: string | null;
  sourceImageAlt: string | null;
  notes: string | null;
  correctAnswer: "tara" | "celebrity" | null;
};

export type SeededWhoLikedItBetterContent = {
  slug: string;
  href: string;
  title: string;
  subtitle?: string | null;
  description: string;
  contentVersion: number;
  gameData: WhoLikedItBetterGameData;
};

const READY_CANDIDATES = new Map(
  (whoLikedItBetterCandidates.readyCandidates as RawCandidate[]).map((candidate) => [candidate.id, candidate])
);

const EXTRA_CANDIDATES: RawCandidate[] = [
  {
    id: "the-incredibles-kanye",
    movieTitle: "The Incredibles",
    movieSlug: "the-incredibles",
    year: 2004,
    taraRating: 3.5,
    celebrityName: "Kanye",
    celebrityRating: 4,
    celebrityRatingSource: "user-supplied rating list",
    celebrityRatingConfidence: "high",
    sourceImagePath: "/images/games/who-liked-it-better/source-images/kanye-the-incredibles.png",
    sourceImageAlt: "Kanye receipt image for The Incredibles",
    notes: "No diary match found; used a fictional Tara fallback rating so the round is playable.",
    correctAnswer: "celebrity"
  },
  {
    id: "the-joker-kanye",
    movieTitle: "The Joker",
    movieSlug: "the-joker",
    year: 2019,
    taraRating: 2.5,
    celebrityName: "Kanye",
    celebrityRating: 4.5,
    celebrityRatingSource: "made-up fallback for gameplay",
    celebrityRatingConfidence: "low",
    sourceImagePath: "/images/games/who-liked-it-better/source-images/kanye-the-joker.png",
    sourceImageAlt: "Kanye receipt image for The Joker",
    notes:
      "No diary match found; used a fictional Tara fallback rating so the round is playable. Celebrity rating was missing; made up a fallback rating as requested.",
    correctAnswer: "celebrity"
  },
  {
    id: "the-truman-show-kanye",
    movieTitle: "The Truman Show",
    movieSlug: "the-truman-show",
    year: 1998,
    taraRating: 2.5,
    celebrityName: "Kanye",
    celebrityRating: 5,
    celebrityRatingSource: "made-up fallback for gameplay",
    celebrityRatingConfidence: "low",
    sourceImagePath: "/images/games/who-liked-it-better/source-images/kanye-the-truman-show.png",
    sourceImageAlt: "Kanye receipt image for The Truman Show",
    notes: "Celebrity rating was missing; made up a fallback rating as requested.",
    correctAnswer: "celebrity"
  },
  {
    id: "dune-kanye",
    movieTitle: "Dune",
    movieSlug: "dune",
    year: 2021,
    taraRating: 3,
    celebrityName: "Kanye",
    celebrityRating: 4.5,
    celebrityRatingSource: "made-up fallback for gameplay",
    celebrityRatingConfidence: "low",
    sourceImagePath: "/images/games/who-liked-it-better/source-images/kanye-dune.png",
    sourceImageAlt: "Kanye receipt image for Dune",
    notes:
      "No diary match found; used a fictional Tara fallback rating so the round is playable. Celebrity rating was missing; made up a fallback rating as requested.",
    correctAnswer: "celebrity"
  },
  {
    id: "get-out-kanye",
    movieTitle: "Get Out",
    movieSlug: "get-out",
    year: 2017,
    taraRating: 4.5,
    celebrityName: "Kanye",
    celebrityRating: 4,
    celebrityRatingSource: "made-up fallback for gameplay",
    celebrityRatingConfidence: "low",
    sourceImagePath: null,
    sourceImageAlt: null,
    notes:
      "Diary entry is unrated; used a fictional Tara fallback rating so the round is playable. Celebrity rating was missing; made up a fallback rating as requested.",
    correctAnswer: "tara"
  },
  {
    id: "no-country-for-old-men-kanye",
    movieTitle: "No Country for Old Men",
    movieSlug: "no-country-for-old-men",
    year: 2007,
    taraRating: 4,
    celebrityName: "Kanye",
    celebrityRating: 5,
    celebrityRatingSource: "made-up fallback for gameplay",
    celebrityRatingConfidence: "low",
    sourceImagePath: null,
    sourceImageAlt: null,
    notes:
      "No diary match found; used a fictional Tara fallback rating so the round is playable. Celebrity rating was missing; made up a fallback rating as requested.",
    correctAnswer: "celebrity"
  }
];

const ALL_CANDIDATES = new Map([
  ...READY_CANDIDATES.entries(),
  ...EXTRA_CANDIDATES.map((candidate) => [candidate.id, candidate] as const)
]);

const QUESTION_GROUPS = [
  ["punch-drunk-love-kid-cudi", "challengers-lukas-gage", "there-will-be-blood-kanye"],
  ["the-incredibles-kanye", "the-joker-kanye", "the-truman-show-kanye"],
  ["dune-kanye", "get-out-kanye", "no-country-for-old-men-kanye"]
] as const;

const POSTER_SLUG_ALIASES: Record<string, string> = {
  "punch-drunk-love": "punchdrunk-love",
  "the-joker": "batman-beyond-return-of-the-joker"
};

const SOURCE_IMAGE_DIMENSIONS = new Map([
  ["/images/games/who-liked-it-better/source-images/kanye-21-jump-street.png", { width: 1384, height: 586 }],
  ["/images/games/who-liked-it-better/source-images/kanye-american-psycho.png", { width: 1362, height: 396 }],
  ["/images/games/who-liked-it-better/source-images/kanye-back-to-the-future.png", { width: 1130, height: 322 }],
  ["/images/games/who-liked-it-better/source-images/kanye-blade-runner-2049.png", { width: 858, height: 358 }],
  ["/images/games/who-liked-it-better/source-images/kanye-dune.png", { width: 942, height: 542 }],
  ["/images/games/who-liked-it-better/source-images/kanye-spirited-away.png", { width: 1656, height: 874 }],
  ["/images/games/who-liked-it-better/source-images/kanye-the-incredibles.png", { width: 2036, height: 810 }],
  ["/images/games/who-liked-it-better/source-images/kanye-the-joker.png", { width: 1780, height: 822 }],
  ["/images/games/who-liked-it-better/source-images/kanye-the-matrix.png", { width: 1074, height: 346 }],
  ["/images/games/who-liked-it-better/source-images/kanye-the-truman-show.png", { width: 1322, height: 508 }],
  ["/images/games/who-liked-it-better/source-images/kanye-there-will-be-blood.png", { width: 1390, height: 888 }]
]);

function resolvePosterSlug(movieSlug: string) {
  return POSTER_SLUG_ALIASES[movieSlug] ?? movieSlug;
}

function toPosterImage(movieSlug: string, movieTitle: string) {
  return {
    src: `/images/games/who-liked-it-better/posters/${resolvePosterSlug(movieSlug)}.png`,
    width: 600,
    height: 900,
    alt: `${movieTitle} poster`
  };
}

function toCelebrityImages(celebrityName: string) {
  switch (celebrityName.toLowerCase()) {
    case "kanye":
      return [
        {
          src: "/images/games/who-liked-it-better/celebrities/kanye/kanye-1.webp",
          width: 1620,
          height: 2160,
          alt: "Kanye West photo 1"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kanye/kanye-2.webp",
          width: 1284,
          height: 1502,
          alt: "Kanye West photo 2"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kanye/kanye-3.webp",
          width: 760,
          height: 1053,
          alt: "Kanye West photo 3"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kanye/kanye-4.webp",
          width: 720,
          height: 916,
          alt: "Kanye West photo 4"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kanye/kanye-5.webp",
          width: 499,
          height: 666,
          alt: "Kanye West photo 5"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kanye/kanye-6.webp",
          width: 500,
          height: 595,
          alt: "Kanye West photo 6"
        }
      ];
    case "kid cudi":
      return [
        {
          src: "/images/games/who-liked-it-better/celebrities/kid-cudi/kid-cudi-1.webp",
          width: 1080,
          height: 960,
          alt: "Kid Cudi photo 1"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kid-cudi/kid-cudi-2.webp",
          width: 1080,
          height: 1076,
          alt: "Kid Cudi photo 2"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kid-cudi/kid-cudi-3.webp",
          width: 1080,
          height: 811,
          alt: "Kid Cudi photo 3"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kid-cudi/kid-cudi-4.webp",
          width: 1080,
          height: 1671,
          alt: "Kid Cudi photo 4"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kid-cudi/kid-cudi-5.webp",
          width: 1080,
          height: 811,
          alt: "Kid Cudi photo 5"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kid-cudi/kid-cudi-6.webp",
          width: 1080,
          height: 808,
          alt: "Kid Cudi photo 6"
        },
        {
          src: "/images/games/who-liked-it-better/celebrities/kid-cudi/kid-cudi-7.jpg",
          width: 736,
          height: 732,
          alt: "Kid Cudi photo 7"
        }
      ];
    default:
      return [];
  }
}

function toSourceImages(candidate: RawCandidate) {
  if (!candidate.sourceImagePath) {
    return [];
  }

  const dimensions = SOURCE_IMAGE_DIMENSIONS.get(candidate.sourceImagePath) ?? { width: 1360, height: 800 };

  return [
    {
      src: candidate.sourceImagePath,
      width: dimensions.width,
      height: dimensions.height,
      alt: candidate.sourceImageAlt ?? `${candidate.celebrityName} source image for ${candidate.movieTitle}`
    }
  ];
}

function getQuestion(candidateId: string) {
  const candidate = ALL_CANDIDATES.get(candidateId);

  if (!candidate || candidate.taraRating === null || candidate.correctAnswer === null) {
    throw new Error(`Missing Tara VS The World candidate: ${candidateId}`);
  }

  const celebrityImages = toCelebrityImages(candidate.celebrityName);
  const sourceImages = toSourceImages(candidate);

  return {
    id: candidate.id,
    movieTitle: candidate.movieTitle,
    movieSlug: candidate.movieSlug,
    year: candidate.year,
    posterImage: toPosterImage(candidate.movieSlug, candidate.movieTitle),
    taraRating: candidate.taraRating,
    celebrityName: candidate.celebrityName,
    celebrityImage: celebrityImages[0] ?? null,
    celebrityImages: celebrityImages.length > 0 ? celebrityImages : undefined,
    celebrityRating: candidate.celebrityRating,
    correctAnswer: candidate.correctAnswer,
    explanation: candidate.notes ?? null,
    sourceImage: sourceImages[0] ?? null,
    sourceImages: sourceImages.length > 0 ? sourceImages : undefined,
    celebrityRatingSource: candidate.celebrityRatingSource,
    celebrityRatingConfidence: candidate.celebrityRatingConfidence
  };
}

export const placeholderWhoLikedItBetterSlug = "tara-who-liked-it-better";
export const placeholderWhoLikedItBetterTitle = "Tara VS The World";
export const placeholderWhoLikedItBetterSubtitle = "Guess whether Tara or the celeb rated the film higher.";
export const placeholderWhoLikedItBetterDescription =
  "Spot who went harder for the movie, reveal both ratings, and see whether your cinema instincts are actually serving.";
export const placeholderWhoLikedItBetterContentVersion = 4;

export const seededWhoLikedItBetterGames: SeededWhoLikedItBetterContent[] = QUESTION_GROUPS.map((questionIds, index) => ({
  slug: index === 0 ? placeholderWhoLikedItBetterSlug : `${placeholderWhoLikedItBetterSlug}-${index + 1}`,
  href:
    index === 0
      ? `/games/who-liked-it-better/${placeholderWhoLikedItBetterSlug}`
      : `/games/who-liked-it-better/${placeholderWhoLikedItBetterSlug}-${index + 1}`,
  title: `${placeholderWhoLikedItBetterTitle} ${index + 1}`,
  subtitle: placeholderWhoLikedItBetterSubtitle,
  description: placeholderWhoLikedItBetterDescription,
  contentVersion: placeholderWhoLikedItBetterContentVersion,
  gameData: {
    schemaVersion: 1,
    questions: questionIds.map((candidateId) => getQuestion(candidateId))
  }
}));

const seededWhoLikedItBetterMap = new Map(seededWhoLikedItBetterGames.map((game) => [game.slug, game]));

export const placeholderWhoLikedItBetterGameData = seededWhoLikedItBetterGames[0]?.gameData ?? {
  schemaVersion: 1,
  questions: QUESTION_GROUPS[0].map((candidateId) => getQuestion(candidateId))
};

export function getSeededWhoLikedItBetterBySlug(slug: string) {
  return seededWhoLikedItBetterMap.get(slug) ?? null;
}

export function getDefaultSeededWhoLikedItBetterGame() {
  const game = seededWhoLikedItBetterGames[0];

  if (!game) {
    throw new Error("At least one seeded Tara VS The World game is required.");
  }

  return game;
}

export function listSeededWhoLikedItBetterSummaries() {
  return seededWhoLikedItBetterGames.map((game) => ({
    slug: game.slug,
    href: game.href,
    title: game.title,
    subtitle: game.subtitle,
    description: game.description,
    contentVersion: game.contentVersion,
    gameData: game.gameData
  }));
}
