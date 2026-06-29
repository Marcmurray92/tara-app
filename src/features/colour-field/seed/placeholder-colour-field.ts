import type {
  ColourFieldGameData,
  ColourFieldLevelData,
  SeededColourFieldSummary
} from "@/features/colour-field/game/colour-field-game.types";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";

export const placeholderColourFieldSlug = "tara-colour-field";
export const placeholderColourFieldTitle = "Colour Field";
export const placeholderColourFieldSubtitle = "Restore each colour field by swapping tiles back into harmony.";
export const placeholderColourFieldDescription =
  "Tap or drag tiles into place and pull the gradient back into harmony without disturbing the fixed anchors.";
export const placeholderColourFieldContentVersion = 3;

function anchorIndexes(columns: number, coordinates: Array<[row: number, column: number]>) {
  return coordinates.map(([row, column]) => row * columns + column);
}

function level(
  id: string,
  title: string,
  description: string,
  columns: number,
  rows: number,
  fixedTileIndexes: number[],
  palette: ColourFieldLevelData["palette"],
  seed: string
): ColourFieldLevelData {
  return {
    id,
    slug: id,
    title,
    description,
    columns,
    rows,
    fixedTileIndexes,
    palette,
    previewDurationMs: 1700,
    seed
  };
}

export const placeholderColourFieldGameData: ColourFieldGameData = {
  schemaVersion: 1,
  introLine: "Tap or drag a tile. Drop it into place. Rebuild the gradient.",
  completionLines: [
    "Field restored.",
    "Beautifully balanced.",
    "That one sings.",
    "Very you."
  ],
  levels: [
    level(
      "midnight-vows",
      "Midnight Vows",
      "Blush and blue folding into a midnight vow.",
      8,
      8,
      anchorIndexes(8, [
        [0, 0],
        [0, 7],
        [3, 3],
        [4, 4],
        [7, 0],
        [7, 7]
      ]),
      {
        topLeft: "#f4ccd8",
        topRight: "#9ebcff",
        bottomLeft: "#6b2449",
        bottomRight: "#161c30"
      },
      "midnight-vows"
    ),
    level(
      "rose-static",
      "Rose Static",
      "Powder rose drifting into moss and smoke.",
      8,
      8,
      anchorIndexes(8, [
        [0, 0],
        [0, 7],
        [2, 2],
        [2, 5],
        [5, 2],
        [5, 5],
        [7, 0],
        [7, 7]
      ]),
      {
        topLeft: "#f2c9c6",
        topRight: "#d7d4dc",
        bottomLeft: "#64704a",
        bottomRight: "#231f29"
      },
      "rose-static"
    ),
    level(
      "chapel-glow",
      "Chapel Glow",
      "Warm candlelight pulling into violet shadow.",
      9,
      9,
      anchorIndexes(9, [
        [0, 0],
        [0, 4],
        [0, 8],
        [4, 4],
        [8, 0],
        [8, 4],
        [8, 8]
      ]),
      {
        topLeft: "#f6d7a7",
        topRight: "#ebc3ba",
        bottomLeft: "#8a3147",
        bottomRight: "#1d1420"
      },
      "chapel-glow"
    ),
    level(
      "velvet-haze",
      "Velvet Haze",
      "Berry, smoke, and a little drama.",
      9,
      9,
      anchorIndexes(9, [
        [0, 0],
        [0, 8],
        [2, 2],
        [2, 6],
        [4, 4],
        [6, 2],
        [6, 6],
        [8, 0],
        [8, 8]
      ]),
      {
        topLeft: "#f2b5c7",
        topRight: "#cab1ff",
        bottomLeft: "#94406f",
        bottomRight: "#2b1e4b"
      },
      "velvet-haze"
    ),
    level(
      "blue-hour",
      "Blue Hour",
      "Indigo slipping into frosted dusk.",
      10,
      10,
      anchorIndexes(10, [
        [0, 0],
        [0, 9],
        [4, 4],
        [5, 5],
        [9, 0],
        [9, 9]
      ]),
      {
        topLeft: "#b7d4ff",
        topRight: "#d0b8ff",
        bottomLeft: "#3e6ac4",
        bottomRight: "#1c233c"
      },
      "blue-hour"
    ),
    level(
      "plum-spell",
      "Plum Spell",
      "Candy gothic, but make it elegant.",
      10,
      10,
      anchorIndexes(10, [
        [0, 0],
        [0, 3],
        [0, 6],
        [0, 9],
        [9, 0],
        [9, 3],
        [9, 6],
        [9, 9]
      ]),
      {
        topLeft: "#f7bfd4",
        topRight: "#f3d0a9",
        bottomLeft: "#844bb5",
        bottomRight: "#381d46"
      },
      "plum-spell"
    ),
    level(
      "mourning-lace",
      "Mourning Lace",
      "Pale silver drifting into moonlit charcoal.",
      10,
      10,
      anchorIndexes(10, [
        [0, 0],
        [0, 9],
        [4, 4],
        [4, 5],
        [5, 4],
        [5, 5],
        [9, 0],
        [9, 9]
      ]),
      {
        topLeft: "#f1eef5",
        topRight: "#d7c8f4",
        bottomLeft: "#7f7593",
        bottomRight: "#1f192a"
      },
      "mourning-lace"
    ),
    level(
      "theatre-hush",
      "Theatre Hush",
      "Velvet curtains, lipstick, blackout.",
      11,
      11,
      anchorIndexes(11, [
        [0, 0],
        [0, 10],
        [5, 0],
        [5, 5],
        [5, 10],
        [10, 0],
        [10, 10]
      ]),
      {
        topLeft: "#f0b1be",
        topRight: "#e4a4ff",
        bottomLeft: "#88244d",
        bottomRight: "#220f2a"
      },
      "theatre-hush"
    ),
    level(
      "violet-psalm",
      "Violet Psalm",
      "Choir-light, bruised purple, deep calm.",
      11,
      11,
      anchorIndexes(11, [
        [0, 0],
        [0, 5],
        [0, 10],
        [5, 0],
        [5, 5],
        [5, 10],
        [10, 0],
        [10, 5],
        [10, 10]
      ]),
      {
        topLeft: "#eee4ff",
        topRight: "#b6c9ff",
        bottomLeft: "#8b63dc",
        bottomRight: "#23163d"
      },
      "violet-psalm"
    ),
    level(
      "afterparty-fog",
      "Afterparty Fog",
      "Champagne blush melting into night.",
      12,
      12,
      anchorIndexes(12, [
        [0, 0],
        [0, 11],
        [5, 5],
        [6, 6],
        [11, 0],
        [11, 11]
      ]),
      {
        topLeft: "#f6dcbf",
        topRight: "#c8e4d7",
        bottomLeft: "#7b5f74",
        bottomRight: "#17302d"
      },
      "afterparty-fog"
    ),
    level(
      "starless-pool",
      "Starless Pool",
      "Ink-blue water with a purple halo.",
      12,
      12,
      anchorIndexes(12, [
        [0, 0],
        [0, 11],
        [3, 3],
        [3, 8],
        [8, 3],
        [8, 8],
        [11, 0],
        [11, 11]
      ]),
      {
        topLeft: "#9cc5ff",
        topRight: "#ceb0ff",
        bottomLeft: "#355ab3",
        bottomRight: "#17172c"
      },
      "starless-pool"
    ),
    level(
      "last-dance",
      "Last Dance",
      "One final shimmer before the lights go up.",
      12,
      12,
      anchorIndexes(12, [
        [0, 0],
        [0, 5],
        [0, 11],
        [3, 3],
        [3, 8],
        [5, 5],
        [6, 6],
        [8, 3],
        [8, 8],
        [11, 0],
        [11, 6],
        [11, 11]
      ]),
      {
        topLeft: "#f4d9b8",
        topRight: "#f6c0e0",
        bottomLeft: "#275c66",
        bottomRight: "#16161e"
      },
      "last-dance"
    )
  ]
};

export function listSeededColourFieldSummaries(): SeededColourFieldSummary[] {
  return [
    {
      slug: placeholderColourFieldSlug,
      href: "/games/colour-field",
      title: getBirthdayDateLabel(0),
      description: "Twelve gradients. Fixed anchors. Very smug colour harmony.",
      contentVersion: placeholderColourFieldContentVersion,
      levelCount: placeholderColourFieldGameData.levels.length
    }
  ];
}

export function getSeededColourFieldLevelBySlug(levelSlug: string) {
  return placeholderColourFieldGameData.levels.find((levelData) => levelData.slug === levelSlug) ?? null;
}
