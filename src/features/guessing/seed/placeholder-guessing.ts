import type { GuessingGameData } from "@/features/guessing/game/guessing-game.types";
import taraReviewQuotesData from "../../../../data/letterboxd/processed/tara-review-quotes.json";

export const placeholderGuessingSlug = "tara-movie-guessing";
export const placeholderGuessingTitle = "Movie Review Guess";
export const placeholderGuessingSubtitle = "Three review rounds. Two mistakes each. Pure cinema pressure.";
export const placeholderGuessingDescription =
  "Read the Letterboxd screenshot, clock the right film, and clear Easy, Medium, and Hard before the review fully drags you.";
export const placeholderGuessingContentVersion = 8;

const MOVIE_REVIEW_GUESS_ASSET_ROOT = "/images/games/movie-review-guess";

const quoteBySlug = new Map(
  taraReviewQuotesData.quotes.map((quote) => [quote.slug, quote.celebrationQuote])
);

function getCelebrationQuote(slug: string) {
  return quoteBySlug.get(slug) ?? null;
}

function getReviewImage(slug: string, label: string, width: number, height: number) {
  return {
    src: `${MOVIE_REVIEW_GUESS_ASSET_ROOT}/reviews/${slug}.png`,
    width,
    height,
    alt: `Letterboxd review screenshot for ${label}`
  };
}

function getPosterImage(slug: string, label: string) {
  return {
    src: `${MOVIE_REVIEW_GUESS_ASSET_ROOT}/posters/${slug}.svg`,
    width: 600,
    height: 900,
    alt: `${label} poster placeholder`
  };
}

export const placeholderGuessingGameData: GuessingGameData = {
  schemaVersion: 2,
  rounds: [
    {
      id: "easy-mean-girls",
      difficulty: "Easy",
      reviewImage: getReviewImage("mean-girls", "Mean Girls", 920, 284),
      choices: [
        { id: "mean-girls", label: "Mean Girls", year: 2004, posterImage: getPosterImage("mean-girls", "Mean Girls") },
        { id: "heathers", label: "Heathers", year: 1988, posterImage: getPosterImage("heathers", "Heathers") },
        { id: "clueless", label: "Clueless", year: 1995, posterImage: getPosterImage("clueless", "Clueless") },
        { id: "easy-a", label: "Easy A", year: 2010, posterImage: getPosterImage("easy-a", "Easy A") }
      ],
      correctChoiceId: "mean-girls",
      celebrationQuote: getCelebrationQuote("mean-girls")
    },
    {
      id: "medium-arrival",
      difficulty: "Medium",
      reviewImage: getReviewImage("arrival", "Arrival", 1380, 726),
      choices: [
        { id: "arrival", label: "Arrival", year: 2016, posterImage: getPosterImage("arrival", "Arrival") },
        { id: "contact", label: "Contact", year: 1997, posterImage: getPosterImage("contact", "Contact") },
        { id: "interstellar", label: "Interstellar", year: 2014, posterImage: getPosterImage("interstellar", "Interstellar") },
        { id: "annihilation", label: "Annihilation", year: 2018, posterImage: getPosterImage("annihilation", "Annihilation") }
      ],
      correctChoiceId: "arrival",
      celebrationQuote: getCelebrationQuote("arrival")
    },
    {
      id: "hard-american-beauty",
      difficulty: "Hard",
      reviewImage: getReviewImage("american-beauty", "American Beauty", 848, 268),
      choices: [
        {
          id: "american-beauty",
          label: "American Beauty",
          year: 1999,
          posterImage: getPosterImage("american-beauty", "American Beauty")
        },
        {
          id: "the-virgin-suicides",
          label: "The Virgin Suicides",
          year: 1999,
          posterImage: getPosterImage("the-virgin-suicides", "The Virgin Suicides")
        },
        {
          id: "revolutionary-road",
          label: "Revolutionary Road",
          year: 2008,
          posterImage: getPosterImage("revolutionary-road", "Revolutionary Road")
        },
        {
          id: "little-children",
          label: "Little Children",
          year: 2006,
          posterImage: getPosterImage("little-children", "Little Children")
        }
      ],
      correctChoiceId: "american-beauty",
      celebrationQuote: getCelebrationQuote("american-beauty")
    }
  ]
};
