export type GuessingChoice = {
  id: string;
  label: string;
};

export type GuessingQuestion = {
  id: string;
  reviewText: string;
  choices: [GuessingChoice, GuessingChoice, GuessingChoice, GuessingChoice];
  correctChoiceId: string;
};

export type GuessingGameData = {
  schemaVersion: 1;
  questions: GuessingQuestion[];
};

