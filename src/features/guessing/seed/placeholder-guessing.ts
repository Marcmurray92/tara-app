import type { GuessingGameData } from "@/features/guessing/game/guessing-game.types";

export const placeholderGuessingSlug = "tara-movie-guessing";
export const placeholderGuessingTitle = "Guessing Game";
export const placeholderGuessingSubtitle = "Match the Letterboxd review screenshot to the right film.";
export const placeholderGuessingDescription =
  "Work through the review screenshots, pick the right movie from four choices, and see how long a streak you can keep going.";
export const placeholderGuessingContentVersion = 2;

export const placeholderGuessingGameData: GuessingGameData = {
  schemaVersion: 1,
  questions: [
    {
      id: "mean-girls",
      reviewImage: {
        src: "/guessing-reviews/mean-girls.png",
        width: 920,
        height: 284,
        alt: "Letterboxd review screenshot for Mean Girls"
      },
      choices: [
        { id: "mean-girls", label: "Mean Girls" },
        { id: "heathers", label: "Heathers" },
        { id: "clueless", label: "Clueless" },
        { id: "easy-a", label: "Easy A" }
      ],
      correctChoiceId: "mean-girls"
    },
    {
      id: "the-bride",
      reviewImage: {
        src: "/guessing-reviews/the-bride.png",
        width: 1018,
        height: 250,
        alt: "Letterboxd review screenshot for The Bride"
      },
      choices: [
        { id: "the-bride", label: "The Bride" },
        { id: "possession", label: "Possession" },
        { id: "the-substance", label: "The Substance" },
        { id: "pearl", label: "Pearl" }
      ],
      correctChoiceId: "the-bride"
    },
    {
      id: "arrival",
      reviewImage: {
        src: "/guessing-reviews/arrival.png",
        width: 1380,
        height: 726,
        alt: "Letterboxd review screenshot for Arrival"
      },
      choices: [
        { id: "arrival", label: "Arrival" },
        { id: "contact", label: "Contact" },
        { id: "interstellar", label: "Interstellar" },
        { id: "annihilation", label: "Annihilation" }
      ],
      correctChoiceId: "arrival"
    },
    {
      id: "american-beauty",
      reviewImage: {
        src: "/guessing-reviews/american-beauty.png",
        width: 848,
        height: 236,
        alt: "Letterboxd review screenshot for American Beauty"
      },
      choices: [
        { id: "american-beauty", label: "American Beauty" },
        { id: "fight-club", label: "Fight Club" },
        { id: "magnolia", label: "Magnolia" },
        { id: "donnie-darko", label: "Donnie Darko" }
      ],
      correctChoiceId: "american-beauty"
    },
    {
      id: "oddity",
      reviewImage: {
        src: "/guessing-reviews/oddity.png",
        width: 1368,
        height: 306,
        alt: "Letterboxd review screenshot for Oddity"
      },
      choices: [
        { id: "oddity", label: "Oddity" },
        { id: "longlegs", label: "Longlegs" },
        { id: "talk-to-me", label: "Talk to Me" },
        { id: "smile", label: "Smile" }
      ],
      correctChoiceId: "oddity"
    },
    {
      id: "the-quiet-girl",
      reviewImage: {
        src: "/guessing-reviews/the-quiet-girl.png",
        width: 1390,
        height: 374,
        alt: "Letterboxd review screenshot for The Quiet Girl"
      },
      choices: [
        { id: "the-quiet-girl", label: "The Quiet Girl" },
        { id: "aftersun", label: "Aftersun" },
        { id: "petite-maman", label: "Petite Maman" },
        { id: "room", label: "Room" }
      ],
      correctChoiceId: "the-quiet-girl"
    },
    {
      id: "harold-and-maude",
      reviewImage: {
        src: "/guessing-reviews/harold-and-maude.png",
        width: 1240,
        height: 264,
        alt: "Letterboxd review screenshot for Harold and Maude"
      },
      choices: [
        { id: "harold-and-maude", label: "Harold and Maude" },
        { id: "rushmore", label: "Rushmore" },
        { id: "the-graduate", label: "The Graduate" },
        { id: "being-there", label: "Being There" }
      ],
      correctChoiceId: "harold-and-maude"
    }
  ]
};
