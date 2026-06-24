import type { GuessingGameData } from "@/features/guessing/game/guessing-game.types";

export const placeholderGuessingSlug = "tara-movie-guessing";
export const placeholderGuessingTitle = "Guessing Game";
export const placeholderGuessingSubtitle = "Match the lovingly specific movie blurb to the right film.";
export const placeholderGuessingDescription =
  "Work through the review clues, pick the right movie from four choices, and see how long a streak you can keep going.";
export const placeholderGuessingContentVersion = 1;

export const placeholderGuessingGameData: GuessingGameData = {
  schemaVersion: 1,
  questions: [
    {
      id: "arrival",
      reviewText: "Alien linguistics, grief, and a sci-fi ending that quietly rearranges your whole brain.",
      choices: [
        { id: "arrival", label: "Arrival" },
        { id: "interstellar", label: "Interstellar" },
        { id: "gravity", label: "Gravity" },
        { id: "contact", label: "Contact" }
      ],
      correctChoiceId: "arrival"
    },
    {
      id: "broadcast-news",
      reviewText: "Everyone is competent, sweaty, ambitious, and just a tiny bit in love inside a gloriously stressed newsroom.",
      choices: [
        { id: "broadcast-news", label: "Broadcast News" },
        { id: "spotlight", label: "Spotlight" },
        { id: "morning-glory", label: "Morning Glory" },
        { id: "network", label: "Network" }
      ],
      correctChoiceId: "broadcast-news"
    },
    {
      id: "gone-girl",
      reviewText: "Marriage as a blood sport, media as accelerant, and one of the all-time icy smile reveals.",
      choices: [
        { id: "gone-girl", label: "Gone Girl" },
        { id: "basic-instinct", label: "Basic Instinct" },
        { id: "girl-on-the-train", label: "The Girl on the Train" },
        { id: "a-simple-favor", label: "A Simple Favor" }
      ],
      correctChoiceId: "gone-girl"
    },
    {
      id: "mamma-mia",
      reviewText: "Sunshine, ABBA, impossible waterfront real estate, and a cast having an openly ridiculous amount of fun.",
      choices: [
        { id: "mamma-mia", label: "Mamma Mia!" },
        { id: "bridesmaids", label: "Bridesmaids" },
        { id: "moulin-rouge", label: "Moulin Rouge!" },
        { id: "the-intern", label: "The Intern" }
      ],
      correctChoiceId: "mamma-mia"
    },
    {
      id: "palm-springs",
      reviewText: "A millennial time-loop romcom where emotional growth somehow feels both sincere and slightly hungover.",
      choices: [
        { id: "palm-springs", label: "Palm Springs" },
        { id: "groundhog-day", label: "Groundhog Day" },
        { id: "about-time", label: "About Time" },
        { id: "50-first-dates", label: "50 First Dates" }
      ],
      correctChoiceId: "palm-springs"
    }
  ]
};
