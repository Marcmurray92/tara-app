import type { GuessingGameData } from "@/features/guessing/game/guessing-game.types";

export const placeholderGuessingSlug = "tara-movie-guessing";
export const placeholderGuessingTitle = "Guessing Game";
export const placeholderGuessingSubtitle = "Match the Letterboxd review screenshot to the right film.";
export const placeholderGuessingDescription =
  "Work through the review screenshots, pick the right movie from four choices, and see how long a streak you can keep going.";
export const placeholderGuessingContentVersion = 3;

export const placeholderGuessingGameData: GuessingGameData = {
  schemaVersion: 1,
  questions: [
    {
      id: "inside-the-manosphere",
      reviewImage: {
        src: "/guessing-reviews/inside-the-manosphere.png",
        width: 1328,
        height: 234,
        alt: "Letterboxd review screenshot for Inside the Manosphere"
      },
      choices: [
        { id: "inside-the-manosphere", label: "Inside the Manosphere" },
        { id: "the-matrix", label: "The Matrix" },
        { id: "fight-club", label: "Fight Club" },
        { id: "american-psycho", label: "American Psycho" }
      ],
      correctChoiceId: "inside-the-manosphere"
    },
    {
      id: "wuthering-heights",
      reviewImage: {
        src: "/guessing-reviews/wuthering-heights.png",
        width: 904,
        height: 312,
        alt: "Letterboxd review screenshot for Wuthering Heights"
      },
      choices: [
        { id: "wuthering-heights", label: "Wuthering Heights" },
        { id: "jane-eyre", label: "Jane Eyre" },
        { id: "pride-and-prejudice", label: "Pride and Prejudice" },
        { id: "little-women", label: "Little Women" }
      ],
      correctChoiceId: "wuthering-heights"
    },
    {
      id: "last-king-of-scotland",
      reviewImage: {
        src: "/guessing-reviews/last-king-of-scotland.png",
        width: 766,
        height: 250,
        alt: "Letterboxd review screenshot for The Last King of Scotland"
      },
      choices: [
        { id: "last-king-of-scotland", label: "The Last King of Scotland" },
        { id: "blood-diamond", label: "Blood Diamond" },
        { id: "hotel-rwanda", label: "Hotel Rwanda" },
        { id: "the-constant-gardener", label: "The Constant Gardener" }
      ],
      correctChoiceId: "last-king-of-scotland"
    },
    {
      id: "marty-supreme",
      reviewImage: {
        src: "/guessing-reviews/marty-supreme.png",
        width: 1048,
        height: 260,
        alt: "Letterboxd review screenshot for Marty Supreme"
      },
      choices: [
        { id: "marty-supreme", label: "Marty Supreme" },
        { id: "uncut-gems", label: "Uncut Gems" },
        { id: "challengers", label: "Challengers" },
        { id: "licorice-pizza", label: "Licorice Pizza" }
      ],
      correctChoiceId: "marty-supreme"
    },
    {
      id: "it-ends",
      reviewImage: {
        src: "/guessing-reviews/it-ends.png",
        width: 840,
        height: 224,
        alt: "Letterboxd review screenshot for It Ends"
      },
      choices: [
        { id: "it-ends", label: "It Ends" },
        { id: "the-brutalist", label: "The Brutalist" },
        { id: "tar", label: "Tar" },
        { id: "megalopolis", label: "Megalopolis" }
      ],
      correctChoiceId: "it-ends"
    },
    {
      id: "high-fidelity",
      reviewImage: {
        src: "/guessing-reviews/high-fidelity.png",
        width: 1446,
        height: 300,
        alt: "Letterboxd review screenshot for High Fidelity"
      },
      choices: [
        { id: "high-fidelity", label: "High Fidelity" },
        { id: "almost-famous", label: "Almost Famous" },
        { id: "500-days-of-summer", label: "500 Days of Summer" },
        { id: "say-anything", label: "Say Anything" }
      ],
      correctChoiceId: "high-fidelity"
    },
    {
      id: "good-boys",
      reviewImage: {
        src: "/guessing-reviews/good-boys.png",
        width: 1410,
        height: 304,
        alt: "Letterboxd review screenshot for Good Boys"
      },
      choices: [
        { id: "good-boys", label: "Good Boys" },
        { id: "superbad", label: "Superbad" },
        { id: "booksmart", label: "Booksmart" },
        { id: "bottoms", label: "Bottoms" }
      ],
      correctChoiceId: "good-boys"
    },
    {
      id: "weapons",
      reviewImage: {
        src: "/guessing-reviews/weapons.png",
        width: 1382,
        height: 232,
        alt: "Letterboxd review screenshot for Weapons"
      },
      choices: [
        { id: "weapons", label: "Weapons" },
        { id: "barbarian", label: "Barbarian" },
        { id: "longlegs", label: "Longlegs" },
        { id: "talk-to-me", label: "Talk to Me" }
      ],
      correctChoiceId: "weapons"
    },
    {
      id: "now-you-see-me",
      reviewImage: {
        src: "/guessing-reviews/now-you-see-me.png",
        width: 1358,
        height: 280,
        alt: "Letterboxd review screenshot for Now You See Me"
      },
      choices: [
        { id: "now-you-see-me", label: "Now You See Me" },
        { id: "the-prestige", label: "The Prestige" },
        { id: "oceans-eleven", label: "Ocean's Eleven" },
        { id: "baby-driver", label: "Baby Driver" }
      ],
      correctChoiceId: "now-you-see-me"
    },
    {
      id: "spring-breakers",
      reviewImage: {
        src: "/guessing-reviews/spring-breakers.png",
        width: 756,
        height: 306,
        alt: "Letterboxd review screenshot for Spring Breakers"
      },
      choices: [
        { id: "spring-breakers", label: "Spring Breakers" },
        { id: "the-bling-ring", label: "The Bling Ring" },
        { id: "project-x", label: "Project X" },
        { id: "zola", label: "Zola" }
      ],
      correctChoiceId: "spring-breakers"
    },
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
