export type ConnectionsGroup = {
  id: string;
  category: string;
  items: [string, string, string, string];
  difficulty?: 1 | 2 | 3 | 4;
};

export type ConnectionsGameData = {
  schemaVersion: 1;
  groups: [ConnectionsGroup, ConnectionsGroup, ConnectionsGroup, ConnectionsGroup];
};

export type ConnectionsTile = {
  id: string;
  label: string;
  groupId: string;
  category: string;
  difficulty?: 1 | 2 | 3 | 4;
};

export type ConnectionsProgressStatus = "playing" | "won" | "lost";

export type ConnectionsGuessOutcome = "solved" | "one-away" | "miss" | "lost";

export type ConnectionsGuessRecord = {
  tileIds: [string, string, string, string];
  outcome: ConnectionsGuessOutcome;
  submittedAt: string;
};

export type ConnectionsProgress = {
  schemaVersion: 2;
  selectedItemIds: string[];
  solvedGroupIds: string[];
  guessHistory: ConnectionsGuessRecord[];
  remainingTileIds: string[];
  mistakes: number;
  shuffleSeed: number;
  startedAt: string | null;
  completedAt: string | null;
  status: ConnectionsProgressStatus;
};

export type ConnectionsSubmitFeedback =
  | {
      type: "solved";
      groupId: string;
    }
  | {
      type: "duplicate";
    }
  | {
      type: "one-away";
    }
  | {
      type: "miss";
    }
  | {
      type: "lost";
    };
