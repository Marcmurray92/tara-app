export type WhoLikedItBetterChoice = "tara" | "celebrity";

export type WhoLikedItBetterImageAsset = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type WhoLikedItBetterQuestion = {
  id: string;
  movieTitle: string;
  movieSlug: string;
  year?: number | null;
  posterImage: WhoLikedItBetterImageAsset;
  taraRating: number;
  celebrityName: string;
  celebrityRating: number;
  correctAnswer: WhoLikedItBetterChoice;
  explanation?: string | null;
  sourceImage?: WhoLikedItBetterImageAsset | null;
  celebrityRatingSource?: string | null;
  celebrityRatingConfidence?: "high" | "medium" | "low";
};

export type WhoLikedItBetterGameData = {
  schemaVersion: 1;
  questions: WhoLikedItBetterQuestion[];
};

export type WhoLikedItBetterAnswerRecord = {
  questionId: string;
  selectedAnswer: WhoLikedItBetterChoice;
  correct: boolean;
  answeredAt: string;
};

export type WhoLikedItBetterProgress = {
  schemaVersion: 1;
  currentQuestionIndex: number;
  answers: WhoLikedItBetterAnswerRecord[];
  score: number;
  startedAt: string | null;
  completedAt: string | null;
};
