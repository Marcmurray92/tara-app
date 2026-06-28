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

const READY_IDS = [
  "punch-drunk-love-kid-cudi",
  "challengers-lukas-gage",
  "there-will-be-blood-kanye"
] as const;

const READY_CANDIDATES = new Map(
  (whoLikedItBetterCandidates.readyCandidates as RawCandidate[]).map((candidate) => [candidate.id, candidate])
);

const SOURCE_IMAGE_DIMENSIONS = new Map([
  ["/images/games/who-liked-it-better/source-images/kanye-21-jump-street.png", { width: 1384, height: 586 }],
  ["/images/games/who-liked-it-better/source-images/kanye-american-psycho.png", { width: 1362, height: 396 }],
  ["/images/games/who-liked-it-better/source-images/kanye-back-to-the-future.png", { width: 1130, height: 322 }],
  ["/images/games/who-liked-it-better/source-images/kanye-blade-runner-2049.png", { width: 858, height: 358 }],
  ["/images/games/who-liked-it-better/source-images/kanye-spirited-away.png", { width: 1656, height: 874 }],
  ["/images/games/who-liked-it-better/source-images/kanye-the-matrix.png", { width: 1074, height: 346 }],
  ["/images/games/who-liked-it-better/source-images/kanye-there-will-be-blood.png", { width: 1390, height: 888 }]
]);

function toPosterImage(movieSlug: string, movieTitle: string) {
  return {
    src: `/images/games/who-liked-it-better/posters/${movieSlug}.svg`,
    width: 600,
    height: 900,
    alt: `${movieTitle} poster placeholder`
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

function getQuestion(candidateId: (typeof READY_IDS)[number]) {
  const candidate = READY_CANDIDATES.get(candidateId);

  if (!candidate || candidate.taraRating === null || candidate.correctAnswer === null) {
    throw new Error(`Missing ready Who Liked It Better candidate: ${candidateId}`);
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
export const placeholderWhoLikedItBetterTitle = "Who Liked It Better";
export const placeholderWhoLikedItBetterSubtitle = "Guess whether Tara or the celeb rated the film higher.";
export const placeholderWhoLikedItBetterDescription =
  "Spot who went harder for the movie, reveal both ratings, and see whether your cinema instincts are actually serving.";
export const placeholderWhoLikedItBetterContentVersion = 4;

export const placeholderWhoLikedItBetterGameData: WhoLikedItBetterGameData = {
  schemaVersion: 1,
  questions: READY_IDS.map((candidateId) => getQuestion(candidateId))
};
