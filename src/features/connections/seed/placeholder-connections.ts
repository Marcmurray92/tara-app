import type { ConnectionsGameData } from "@/features/connections/game/connections-game.types";

export const placeholderConnectionsSlug = "tara-movie-connections";
export const placeholderConnectionsTitle = "Connections";
export const placeholderConnectionsSubtitle = "Four film categories, sixteen titles, and only four mistakes to spend.";
export const placeholderConnectionsDescription =
  "Group the movie tiles into four hidden sets. Shuffle when you need fresh eyes, and try not to burn through all four mistakes.";
export const placeholderConnectionsContentVersion = 2;

export const placeholderConnectionsGameData: ConnectionsGameData = {
  schemaVersion: 1,
  groups: [
    {
      id: "time-loops",
      category: "Time loops",
      items: ["Groundhog Day", "Palm Springs", "Edge of Tomorrow", "Happy Death Day"],
      difficulty: 1
    },
    {
      id: "newsroom-chaos",
      category: "Newsroom chaos",
      items: ["Broadcast News", "Spotlight", "Anchorman", "Network"],
      difficulty: 2
    },
    {
      id: "revenge-mode",
      category: "Revenge mode",
      items: ["Gone Girl", "Kill Bill", "Promising Young Woman", "John Wick"],
      difficulty: 3
    },
    {
      id: "wedding-chaos",
      category: "Wedding chaos",
      items: ["Bridesmaids", "Mamma Mia!", "My Best Friend's Wedding", "Wedding Crashers"],
      difficulty: 4
    }
  ]
};
