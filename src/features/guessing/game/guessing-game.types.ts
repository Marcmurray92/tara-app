export type GuessingChoice = {
  id: string;
  label: string;
  year?: number;
  posterImage?: GuessingImageAsset;
};

export type GuessingImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type GuessingDifficulty = "Easy" | "Medium" | "Hard";

export type GuessingRound = {
  id: string;
  difficulty: GuessingDifficulty;
  reviewImage: GuessingImageAsset;
  choices: [GuessingChoice, GuessingChoice, GuessingChoice, GuessingChoice];
  correctChoiceId: string;
  celebrationQuote?: string | null;
};

export type GuessingGameData = {
  schemaVersion: 2;
  rounds: [GuessingRound, GuessingRound, GuessingRound];
};

export type GuessingRoundResult = "active" | "solved" | "failed";

export type GuessingRoundRecord = {
  roundId: string;
  attemptedChoiceIds: string[];
  result: GuessingRoundResult;
  completedAt: string | null;
};

export type GuessingProgress = {
  schemaVersion: 2;
  currentRoundIndex: number;
  roundRecords: GuessingRoundRecord[];
  startedAt: string | null;
  completedAt: string | null;
};
