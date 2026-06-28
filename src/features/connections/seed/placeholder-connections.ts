import type { ConnectionsGameData } from "@/features/connections/game/connections-game.types";
import { slugify } from "@/lib/utils/strings";

type ConnectionsGroupBlueprint = {
  id?: string;
  category: string;
  words: [string, string, string, string];
};

type ConnectionsBlueprint = {
  slug?: string;
  title: string;
  subtitle?: string | null;
  description: string;
  author: string;
  groups: [
    ConnectionsGroupBlueprint,
    ConnectionsGroupBlueprint,
    ConnectionsGroupBlueprint,
    ConnectionsGroupBlueprint
  ];
};

export type SeededConnectionsContent = {
  slug: string;
  href: string;
  title: string;
  subtitle?: string | null;
  description: string;
  author: string;
  contentVersion: number;
  groupCount: number;
  gameData: ConnectionsGameData;
};

const CONTENT_VERSION = 2;

const RAW_CONNECTIONS_BLUEPRINTS: ConnectionsBlueprint[] = [
  {
    slug: "tara-movie-connections",
    title: "Board 1",
    subtitle: null,
    description: "Four hidden movie groups.",
    author: "Tara App",
    groups: [
      {
        id: "time-loops",
        category: "Time loops",
        words: ["Groundhog Day", "Palm Springs", "Edge of Tomorrow", "Happy Death Day"]
      },
      {
        id: "newsroom-chaos",
        category: "Newsroom chaos",
        words: ["Broadcast News", "Spotlight", "Anchorman", "Network"]
      },
      {
        id: "revenge-mode",
        category: "Revenge mode",
        words: ["Gone Girl", "Kill Bill", "Promising Young Woman", "John Wick"]
      },
      {
        id: "wedding-chaos",
        category: "Wedding chaos",
        words: ["Bridesmaids", "Mamma Mia!", "My Best Friend's Wedding", "Wedding Crashers"]
      }
    ]
  },
  {
    title: "Arctic Monkeys Round",
    subtitle: null,
    description: "Marc's Arctic Monkeys-heavy board.",
    author: "Marc",
    groups: [
      {
        category: "WORDS THAT CAN FOLLOW 'CRYING'",
        words: ["LIGHTNING", "SHAME", "WOLF", "GAME"]
      },
      {
        category: "HOTEL / LOUNGE WORDS",
        words: ["LOBBY", "BAR", "SUITE", "ROOM"]
      },
      {
        category: "THINGS WITH NUMBERS IN THE TITLE",
        words: ["505", "7", "NO. 1", "4/5"]
      },
      {
        category: "ADJECTIVES FROM SONG TITLES",
        words: ["FLUORESCENT", "CERTAIN", "SECRET", "PRETTY"]
      }
    ]
  },
  {
    title: "Trellis, Charts and Monkeys",
    subtitle: null,
    description: "Marc's board of charts, THC, monkeys, and clues.",
    author: "Marc",
    groups: [
      {
        category: "TYPES OF CHART",
        words: ["PIE", "BAR", "SCATTER", "BULLET"]
      },
      {
        category: "THC DELIVERY SYSTEMS",
        words: ["BROWNIES", "SWEETS", "PIPES", "PINNERS"]
      },
      {
        category: "CAN PRECEDE 'MONKEY'",
        words: ["ARCTIC", "FUNKY", "CHUNKY", "CHEEKY"]
      },
      {
        category: "KNIVES OUT EVIDENCE",
        words: ["REPORT", "VIALS", "TRELLIS", "FOOTPRINTS"]
      }
    ]
  },
  {
    title: "Supes, Smallville and Olaf",
    subtitle: null,
    description: "Marc's board of supes, Smallville, disguises, and exes.",
    author: "Marc",
    groups: [
      {
        category: "OBSCURE SUPES FROM THE BOYS",
        words: ["GECKO", "POPCLAW", "SHOCKWAVE", "GUNPOWDER"]
      },
      {
        category: "SMALLVILLE CHARACTERS",
        words: ["LEX", "LANA", "CHLOE", "LOIS"]
      },
      {
        category: "COUNT OLAF DISGUISES",
        words: ["STEPHANO", "YESSICA HAIRCUT", "CAPTAIN SHAM", "SHIRLEY"]
      },
      {
        category: "KIMMIE'S EXES",
        words: ["RAY", "REGGIE", "PETE", "ODELL"]
      }
    ]
  },
  {
    title: "Irish Things",
    subtitle: null,
    description: "Marc's board of Irish politics, TV, and Belvedere bits.",
    author: "Marc",
    groups: [
      {
        category: "IRISH POLITICAL CHARACTERS",
        words: ["MICHAEL LOWRY", "BERTIE AHERN", "MATTIE MCGRATH", "WILLIE O'DEA"]
      },
      {
        category: "THE __ TV SHOWS",
        words: ["BEAR", "BOYS", "CROWN", "OFFICE"]
      },
      {
        category: "THINGS BEFORE 'IRISH'",
        words: ["GOODBYE", "COFFEE", "STEW", "DANCE"]
      },
      {
        category: "THINGS NEAR BELVEDERE",
        words: ["HOUSE", "GARDENS", "FOLLY", "WALL"]
      }
    ]
  },
  {
    title: "Movies and Broadcasts",
    subtitle: null,
    description: "Marc's board of non-linear cinema, Seth Rogen, and newsrooms.",
    author: "Marc",
    groups: [
      {
        category: "MOVIES WITH NON-LINEAR TIME",
        words: ["ARRIVAL", "MEMENTO", "TENET", "PRIMER"]
      },
      {
        category: "SETH ROGEN MOVIES",
        words: ["SUPERBAD", "PINEAPPLE EXPRESS", "KNOCKED UP", "NEIGHBORS"]
      },
      {
        category: "PARTS OF A NEWS BROADCAST",
        words: ["INTERVIEW", "REPORT", "ANCHOR", "SEGMENT"]
      },
      {
        category: "SUPERBAD CHARACTERS",
        words: ["SETH", "EVAN", "FOGELL", "MCLOVIN"]
      }
    ]
  },
  {
    title: "Good Girls and Fleabag",
    subtitle: null,
    description: "Marc's board of one-name icons, TV titles, and good/girl fillers.",
    author: "Marc",
    groups: [
      {
        category: "ONE-NAME COMEDY CHARACTERS",
        words: ["MCLOVIN", "BORAT", "BRUNO", "FLEABAG"]
      },
      {
        category: "CAN FOLLOW 'GOOD'",
        words: ["BOYS", "LUCK", "NEWS", "FRIDAY"]
      },
      {
        category: "ONE-WORD TV SHOW TITLES",
        words: ["FLEABAG", "SUCCESSION", "ATLANTA", "GIRLS"]
      },
      {
        category: "CAN FOLLOW 'GIRL'",
        words: ["BOSS", "FRIEND", "POWER", "HOOD"]
      }
    ]
  },
  {
    title: "Kneel",
    subtitle: null,
    description: "Marc's board of Fleabag, bears, posts, and old Facebook behaviour.",
    author: "Marc",
    groups: [
      {
        category: "FLEABAG QUOTE WORDS",
        words: ["PASS", "LOVE", "PAIN", "KNEEL"]
      },
      {
        category: "TYPES OF BEAR",
        words: ["GUMMY", "TEDDY", "BLACK", "CARE"]
      },
      {
        category: "POST __",
        words: ["OFFICE", "MALONE", "IT", "CARD"]
      },
      {
        category: "FACEBOOK ACTIONS",
        words: ["FRIEND", "POST", "LIKE", "POKE"]
      }
    ]
  },
  {
    title: "It's Not Easy Being Green",
    subtitle: null,
    description: "PL's board of puppets, games, songs, and green-coded meanings.",
    author: "PL",
    groups: [
      {
        category: "FAMOUS PUPPETS",
        words: ["KERMIT", "OSCAR", "PINOCCHIO", "HOWDY DOODY"]
      },
      {
        category: "GAMES THAT TEST STRATEGIC THINKING",
        words: ["CHESS", "BACKGAMMON", "SCRABBLE", "BRIDGE"]
      },
      {
        category: "ELEMENTS OF A POP OR ROCK SONG",
        words: ["CHORUS", "SOLO", "VERSE", "TURNAROUND"]
      },
      {
        category: "ASSOCIATIONS WITH THE COLOR GREEN",
        words: ["ENVY", "MONEY", "GO", "NOVICE"]
      }
    ]
  },
  {
    title: "Don't Overthink It",
    subtitle: null,
    description: "cat lover's board of Reddit, rhymes, and break phrases.",
    author: "cat lover",
    groups: [
      {
        category: "REDDIT FEATURES",
        words: ["UPVOTE", "DOWNVOTE", "SHARE", "COMMENT"]
      },
      {
        category: "UNUSUAL",
        words: ["ODD", "WEIRD", "STRANGE", "CURIOUS"]
      },
      {
        category: "RHYMES",
        words: ["ANTS", "PRANCE", "TRANCE", "GRANTS"]
      },
      {
        category: "BREAK __",
        words: ["BREAD", "DOWN", "DANCE", "EVEN"]
      }
    ]
  },
  {
    title: "It's Not That Kind of Puzzle, I Swear",
    subtitle: null,
    description: "Janus1172's board of wet words, stage names, strikes, and day phrases.",
    author: "Janus1172",
    groups: [
      {
        category: "WORDS FOR WET",
        words: ["SOAKING", "DRENCHED", "SOGGY", "MOIST"]
      },
      {
        category: "MUSICIAN STAGE NAMES",
        words: ["EDGE", "PINK", "STING", "SLASH"]
      },
      {
        category: "ASSOCIATED WITH WORK STOPPAGES",
        words: ["GOON", "SCAB", "PICKET", "STRIKE"]
      },
      {
        category: "__ DAY",
        words: ["HUMP", "RED LETTER", "FIELD", "RAINY"]
      }
    ]
  },
  {
    title: "Know Your Emojis?",
    subtitle: null,
    description: "Optimistic Giraffe's emoji-only board.",
    author: "Optimistic Giraffe",
    groups: [
      {
        category: "CELEBRATIONS",
        words: ["🥂", "🎉", "🙌", "🎂"]
      },
      {
        category: "AFFIRMATIVE",
        words: ["👍", "🌞", "💯", "👌"]
      },
      {
        category: "NO WAY!",
        words: ["🤯", "😮", "😱", "😲"]
      },
      {
        category: "GEN-Z REACTIONS",
        words: ["🧢", "🔥", "💀", "🤡"]
      }
    ]
  },
  {
    title: "An Outstanding One",
    subtitle: null,
    description: "AC's board of superlatives, currencies, Potter, and weights.",
    author: "AC",
    groups: [
      {
        category: "SUPERLATIVE",
        words: ["STERLING", "OUTSTANDING", "SPLENDID", "EXCEPTIONAL"]
      },
      {
        category: "EUROPEAN CURRENCY",
        words: ["POUND", "FRANC", "KRONE", "MARK"]
      },
      {
        category: "WORDS THAT PRECEDE 'OF' IN HARRY POTTER TITLES",
        words: ["GOBLET", "PRISONER", "ORDER", "CHAMBER"]
      },
      {
        category: "UNITS OF WEIGHT MEASUREMENT",
        words: ["STONE", "KILOGRAM", "SACK", "GRAIN"]
      }
    ]
  },
  {
    title: "\"Lions and Tigers and Bears, Oh My!\"",
    subtitle: null,
    description: "A board of Oz references, warm friendships, soundalikes, and triple-song titles.",
    author: "Unknown",
    groups: [
      {
        category: "\"LIONS AND TIGERS AND BEARS, OH MY!\"",
        words: ["BEARS", "LIONS", "OH MY", "TIGERS"]
      },
      {
        category: "BELOVED, AS A FRIEND",
        words: ["CLOSE", "DEAR", "INTIMATE", "TIGHT"]
      },
      {
        category: "WORDS THAT SOUND LIKE PLURAL LETTERS",
        words: ["BEES", "EASE", "JAYS", "USE"]
      },
      {
        category: "WHEN TRIPLED, HIT SONG TITLES",
        words: ["BILLS", "BYE", "GIMME", "PLEASE"]
      }
    ]
  },
  {
    title: "Red Herring: Theme Park",
    subtitle: null,
    description: "A red herring board of theme-park-ish bait and actual sets.",
    author: "Unknown",
    groups: [
      {
        category: "ROUND FLAT THINGS",
        words: ["COASTER", "FRISBEE", "PANCAKE", "RECORD"]
      },
      {
        category: "AIRPORT FEATURES",
        words: ["CAROUSEL", "FOOD COURT", "GATE", "LOUNGE"]
      },
      {
        category: "GUITAR PLAYING TECHNIQUES",
        words: ["BEND", "PICK", "SLIDE", "STRUM"]
      },
      {
        category: "WHAT CHARACTERS WERE TRANSFORMED INTO IN BEAUTY AND THE BEAST",
        words: ["BEAST", "CANDELABRA", "CLOCK", "TEACUP"]
      }
    ]
  },
  {
    title: "Red Herring: EGOT",
    subtitle: null,
    description: "A red herring board of Sopranos, nicknames, Sesame Street, and letter-sounding names.",
    author: "Unknown",
    groups: [
      {
        category: "SOPRANOS",
        words: ["CARMELA", "JUNIOR", "MEADOW", "TONY"]
      },
      {
        category: "FAMILIAL NICKNAMES",
        words: ["CUZ", "GRAMMY", "MUMMY", "POP"]
      },
      {
        category: "SESAME STREET CHARACTERS",
        words: ["COOKIE", "COUNT", "OSCAR", "SNUFFY"]
      },
      {
        category: "NAMES THAT SOUND LIKE TWO LETTERS",
        words: ["CECE", "EDIE", "EMMY", "KATIE"]
      }
    ]
  },
  {
    title: "Red Herring: Wordle Starters",
    subtitle: null,
    description: "A red herring board of lineups, NYT stuff, paper folds, and French words.",
    author: "Unknown",
    groups: [
      {
        category: "LINEUP",
        words: ["BILL", "PROGRAM", "SCHEDULE", "SLATE"]
      },
      {
        category: "NYT OFFERINGS",
        words: ["AUDIO", "COOKING", "GAMES", "NEWS"]
      },
      {
        category: "THINGS MADE BY FOLDING PAPER",
        words: ["AIRPLANE", "CRANE", "FAN", "FORTUNE TELLER"]
      },
      {
        category: "FRENCH WORDS",
        words: ["ADIEU", "BELLE", "PAIN", "TEMPS"]
      }
    ]
  },
  {
    title: "Red Herring: Powerpuff Girls",
    subtitle: null,
    description: "A red herring board of fizz, growth, music mags, and sneaky tableware endings.",
    author: "Unknown",
    groups: [
      {
        category: "EFFERVESCENCE",
        words: ["BUBBLES", "FIZZ", "FOAM", "FROTH"]
      },
      {
        category: "BURGEON",
        words: ["BLOSSOM", "DEVELOP", "MATURE", "PROGRESS"]
      },
      {
        category: "MUSIC PUBLICATIONS",
        words: ["BILLBOARD", "MOJO", "PITCHFORK", "SPIN"]
      },
      {
        category: "ENDING WITH TABLEWARE",
        words: ["BOILERPLATE", "BUTTERCUP", "JACKKNIFE", "WITHERSPOON"]
      }
    ]
  },
  {
    title: "Red Herring: Pop",
    subtitle: null,
    description: "A red herring board of longing, magazines, Bond, and pop subgenres.",
    author: "Unknown",
    groups: [
      {
        category: "YEARN",
        words: ["DESIRE", "LONG", "PINE", "YEN"]
      },
      {
        category: "MAGAZINES",
        words: ["FORTUNE", "MAD", "NATURE", "O"]
      },
      {
        category: "CHARACTERS IN BOND MOVIES",
        words: ["BOND", "M", "MONEYPENNY", "Q"]
      },
      {
        category: "WORDS THAT PRECEDE 'POP' IN MUSIC GENRES",
        words: ["BUBBLEGUM", "EURO", "K", "POWER"]
      }
    ]
  },
  {
    title: "Red Herring: Movie Titles",
    subtitle: null,
    description: "A red herring board of films split into their title parts.",
    author: "Unknown",
    groups: [
      {
        category: "ROCKY HORROR PICTURE SHOW",
        words: ["HORROR", "PICTURE", "ROCKY", "SHOW"]
      },
      {
        category: "WHO FRAMED ROGER RABBIT",
        words: ["FRAMED", "RABBIT", "ROGER", "WHO"]
      },
      {
        category: "WHEN HARRY MET SALLY",
        words: ["HARRY", "MET", "SALLY", "WHEN"]
      },
      {
        category: "MAD MAX FURY ROAD",
        words: ["FURY", "MAD", "MAX", "ROAD"]
      }
    ]
  },
  {
    title: "Red Herring: Number Homophones",
    subtitle: null,
    description: "A red herring board of replacements, bowling, swag, and number soundalikes.",
    author: "Unknown",
    groups: [
      {
        category: "REPLACEMENT",
        words: ["BACKUP", "COPY", "EXTRA", "SPARE"]
      },
      {
        category: "BOWLING",
        words: ["ALLEY", "BALL", "LANE", "PIN"]
      },
      {
        category: "COMMON SWAG ITEMS",
        words: ["MUG", "PEN", "TEE", "TOTE"]
      },
      {
        category: "NUMBER HOMOPHONES",
        words: ["ATE", "FOR", "TOO", "WON"]
      }
    ]
  }
];

function buildConnectionsGameData(blueprint: ConnectionsBlueprint): ConnectionsGameData {
  return {
    schemaVersion: 1,
    groups: blueprint.groups.map((group, index) => ({
      id: group.id ?? slugify(group.category),
      category: group.category,
      items: group.words,
      difficulty: (index + 1) as 1 | 2 | 3 | 4
    })) as ConnectionsGameData["groups"]
  };
}

function dedupeConnectionsBlueprints(blueprints: ConnectionsBlueprint[]) {
  const seen = new Set<string>();

  return blueprints.filter((blueprint) => {
    const slug = blueprint.slug ?? slugify(blueprint.title);

    if (seen.has(slug)) {
      return false;
    }

    seen.add(slug);
    return true;
  });
}

export const seededConnections = dedupeConnectionsBlueprints(RAW_CONNECTIONS_BLUEPRINTS).map<SeededConnectionsContent>(
  (blueprint) => {
    const slug = blueprint.slug ?? slugify(blueprint.title);

    return {
      slug,
      href: `/games/connections/${slug}`,
      title: blueprint.title,
      subtitle: blueprint.subtitle,
      description: blueprint.description,
      author: blueprint.author,
      contentVersion: CONTENT_VERSION,
      groupCount: blueprint.groups.length,
      gameData: buildConnectionsGameData(blueprint)
    };
  }
);

const seededConnectionsMap = new Map(seededConnections.map((connections) => [connections.slug, connections]));

export function getSeededConnectionsBySlug(slug: string) {
  return seededConnectionsMap.get(slug) ?? null;
}

export function getDefaultSeededConnections() {
  const connections = seededConnections[0];

  if (!connections) {
    throw new Error("At least one seeded Connections puzzle is required.");
  }

  return connections;
}

export function listSeededConnectionsSummaries() {
  return seededConnections.map((connections) => ({
    slug: connections.slug,
    href: connections.href,
    title: connections.title,
    subtitle: connections.subtitle,
    description: connections.description,
    author: connections.author,
    contentVersion: connections.contentVersion,
    groupCount: connections.groupCount
  }));
}

const defaultConnections = getDefaultSeededConnections();

export const placeholderConnectionsSlug = defaultConnections.slug;
export const placeholderConnectionsTitle = "Connections";
export const placeholderConnectionsSubtitle =
  "Four film categories, sixteen titles, and only four mistakes to spend.";
export const placeholderConnectionsDescription =
  "Group the movie tiles into four hidden sets. Shuffle when you need fresh eyes, and try not to burn through all four mistakes.";
export const placeholderConnectionsContentVersion = defaultConnections.contentVersion;
export const placeholderConnectionsGameData = defaultConnections.gameData;
