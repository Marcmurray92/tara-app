export type GuessingChoice = {
  id: string;
  label: string;
};

export type GuessingReviewImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type GuessingQuestion = {
  id: string;
  reviewText?: string;
  reviewImage?: GuessingReviewImage;
  choices: [GuessingChoice, GuessingChoice, GuessingChoice, GuessingChoice];
  correctChoiceId: string;
};

export type GuessingGameData = {
  schemaVersion: 1;
  questions: GuessingQuestion[];
};

export type GuessingAnswerRecord = {
  questionId: string;
  selectedChoiceId: string;
  correct: boolean;
};

export type GuessingProgress = {
  schemaVersion: 1;
  currentQuestionIndex: number;
  answers: GuessingAnswerRecord[];
  score: number;
  streak: number;
  bestStreak: number;
  startedAt: string | null;
  completedAt: string | null;
};
