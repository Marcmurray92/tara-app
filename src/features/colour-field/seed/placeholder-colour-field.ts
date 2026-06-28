import type {
  ColourFieldGameData,
  ColourFieldLevelData,
  SeededColourFieldSummary
} from "@/features/colour-field/game/colour-field-game.types";

export const placeholderColourFieldSlug = "tara-colour-field";
export const placeholderColourFieldTitle = "Colour Field";
export const placeholderColourFieldSubtitle = "Restore each colour field by swapping tiles back into harmony.";
export const placeholderColourFieldDescription =
  "Tap one tile, tap another, and pull the gradient back into place without disturbing the fixed anchors.";
export const placeholderColourFieldContentVersion = 1;

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
  introLine: "Tap a tile. Tap another tile. Rebuild the gradient.",
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
      "Soft lilac into chapel-night plum.",
      3,
      3,
      [0, 2, 6, 8],
      {
        topLeft: "#f3b7d6",
        topRight: "#d0a4ff",
        bottomLeft: "#6846d5",
        bottomRight: "#241633"
      },
      "midnight-vows"
    ),
    level(
      "rose-static",
      "Rose Static",
      "Dusky blush, soft silver, then the comedown.",
      3,
      3,
      [0, 2, 4, 6, 8],
      {
        topLeft: "#f6c8c8",
        topRight: "#f2a7d7",
        bottomLeft: "#8f6bc1",
        bottomRight: "#33224f"
      },
      "rose-static"
    ),
    level(
      "chapel-glow",
      "Chapel Glow",
      "Warm candlelight pulling into violet shadow.",
      4,
      4,
      [0, 3, 12, 15],
      {
        topLeft: "#f6d7a7",
        topRight: "#eebbc3",
        bottomLeft: "#6d56c5",
        bottomRight: "#24162f"
      },
      "chapel-glow"
    ),
    level(
      "velvet-haze",
      "Velvet Haze",
      "Berry, smoke, and a little drama.",
      4,
      4,
      [0, 3, 5, 10, 12, 15],
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
      4,
      4,
      [0, 3, 12, 15],
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
      4,
      4,
      [0, 1, 2, 3, 12, 13, 14, 15],
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
      5,
      5,
      [0, 4, 12, 20, 24],
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
      5,
      5,
      [0, 4, 10, 14, 20, 24],
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
      5,
      5,
      [0, 2, 4, 10, 12, 14, 20, 22, 24],
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
      5,
      5,
      [0, 4, 12, 20, 24],
      {
        topLeft: "#f6dcbf",
        topRight: "#f7b8c8",
        bottomLeft: "#8d5a8a",
        bottomRight: "#26192e"
      },
      "afterparty-fog"
    ),
    level(
      "starless-pool",
      "Starless Pool",
      "Ink-blue water with a purple halo.",
      6,
      6,
      [0, 5, 14, 21, 30, 35],
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
      6,
      6,
      [0, 5, 14, 15, 20, 21, 30, 35],
      {
        topLeft: "#f4d9b8",
        topRight: "#f6c0e0",
        bottomLeft: "#5d4eb4",
        bottomRight: "#191320"
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
      title: "Field Set 1",
      description: "Twelve gradients. Fixed anchors. Very smug colour harmony.",
      contentVersion: placeholderColourFieldContentVersion,
      levelCount: placeholderColourFieldGameData.levels.length
    }
  ];
}

export function getSeededColourFieldLevelBySlug(levelSlug: string) {
  return placeholderColourFieldGameData.levels.find((levelData) => levelData.slug === levelSlug) ?? null;
}
