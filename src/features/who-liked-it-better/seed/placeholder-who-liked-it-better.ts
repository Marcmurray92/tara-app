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
  "the-holiday-lukas-gage",
  "malignant-chvrches",
  "jennifer-s-body-chvrches",
  "blade-runner-2049-kanye",
  "there-will-be-blood-kanye",
  "american-psycho-kanye",
  "21-jump-street-kanye",
  "spirited-away-kanye"
] as const;

const READY_CANDIDATES = new Map(
  (whoLikedItBetterCandidates.readyCandidates as RawCandidate[]).map((candidate) => [candidate.id, candidate])
);

function toPosterImage(movieSlug: string, movieTitle: string) {
  return {
    src: `/images/games/who-liked-it-better/posters/${movieSlug}.svg`,
    width: 600,
    height: 900,
    alt: `${movieTitle} poster placeholder`
  };
}

function toCelebrityImage(celebrityName: string) {
  if (celebrityName.toLowerCase() === "kanye") {
    return {
      src: "/images/games/who-liked-it-better/celebrities/kanye-west.svg",
      width: 640,
      height: 640,
      alt: "Kanye West portrait illustration"
    };
  }

  return null;
}

function getQuestion(candidateId: (typeof READY_IDS)[number]) {
  const candidate = READY_CANDIDATES.get(candidateId);

  if (!candidate || candidate.taraRating === null || candidate.correctAnswer === null) {
    throw new Error(`Missing ready Who Liked It Better candidate: ${candidateId}`);
  }

  return {
    id: candidate.id,
    movieTitle: candidate.movieTitle,
    movieSlug: candidate.movieSlug,
    year: candidate.year,
    posterImage: toPosterImage(candidate.movieSlug, candidate.movieTitle),
    taraRating: candidate.taraRating,
    celebrityName: candidate.celebrityName,
    celebrityImage: toCelebrityImage(candidate.celebrityName),
    celebrityRating: candidate.celebrityRating,
    correctAnswer: candidate.correctAnswer,
    explanation: candidate.notes ?? null,
    sourceImage: candidate.sourceImagePath
      ? {
          src: candidate.sourceImagePath,
          width: 1360,
          height: 800,
          alt: candidate.sourceImageAlt ?? `${candidate.celebrityName} source image for ${candidate.movieTitle}`
        }
      : null,
    celebrityRatingSource: candidate.celebrityRatingSource,
    celebrityRatingConfidence: candidate.celebrityRatingConfidence
  };
}

export const placeholderWhoLikedItBetterSlug = "tara-who-liked-it-better";
export const placeholderWhoLikedItBetterTitle = "Who Liked It Better";
export const placeholderWhoLikedItBetterSubtitle = "Guess whether Tara or the celeb rated the film higher.";
export const placeholderWhoLikedItBetterDescription =
  "Spot who went harder for the movie, reveal both ratings, and see whether your cinema instincts are actually serving.";
export const placeholderWhoLikedItBetterContentVersion = 3;

export const placeholderWhoLikedItBetterGameData: WhoLikedItBetterGameData = {
  schemaVersion: 1,
  questions: READY_IDS.map((candidateId) => getQuestion(candidateId))
};
