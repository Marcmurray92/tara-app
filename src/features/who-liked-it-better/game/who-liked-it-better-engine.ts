import type {
  WhoLikedItBetterAnswerRecord,
  WhoLikedItBetterChoice,
  WhoLikedItBetterGameData,
  WhoLikedItBetterProgress
} from "@/features/who-liked-it-better/game/who-liked-it-better-game.types";

export function createWhoLikedItBetterProgress(): WhoLikedItBetterProgress {
  return {
    schemaVersion: 1,
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    startedAt: null,
    completedAt: null
  };
}

export function getCurrentWhoLikedItBetterQuestion(
  gameData: WhoLikedItBetterGameData,
  progress: WhoLikedItBetterProgress
) {
  return gameData.questions[progress.currentQuestionIndex] ?? null;
}

export function getWhoLikedItBetterAnswerRecord(
  progress: WhoLikedItBetterProgress,
  questionId: string
) {
  return progress.answers.find((answer) => answer.questionId === questionId) ?? null;
}

export function answerWhoLikedItBetterQuestion({
  gameData,
  progress,
  selectedAnswer,
  now
}: {
  gameData: WhoLikedItBetterGameData;
  progress: WhoLikedItBetterProgress;
  selectedAnswer: WhoLikedItBetterChoice;
  now: string;
}) {
  const question = getCurrentWhoLikedItBetterQuestion(gameData, progress);

  if (!question || progress.completedAt || progress.answers.some((answer) => answer.questionId === question.id)) {
    return {
      progress,
      correct: false
    };
  }

  const correct = question.correctAnswer === selectedAnswer;
  const answerRecord: WhoLikedItBetterAnswerRecord = {
    questionId: question.id,
    selectedAnswer,
    correct,
    answeredAt: now
  };
  const answers = [...progress.answers, answerRecord];
  const completedAt = answers.length === gameData.questions.length ? now : null;

  return {
    progress: {
      ...progress,
      answers,
      score: progress.score + (correct ? 1 : 0),
      startedAt: progress.startedAt ?? now,
      completedAt
    },
    correct
  };
}

export function advanceWhoLikedItBetterQuestion(
  gameData: WhoLikedItBetterGameData,
  progress: WhoLikedItBetterProgress
) {
  const question = getCurrentWhoLikedItBetterQuestion(gameData, progress);

  if (!question || progress.completedAt) {
    return progress;
  }

  const answered = progress.answers.some((answer) => answer.questionId === question.id);
  if (!answered) {
    return progress;
  }

  return {
    ...progress,
    currentQuestionIndex: Math.min(progress.currentQuestionIndex + 1, gameData.questions.length - 1)
  };
}

export function getWhoLikedItBetterStatusSummary(progress: WhoLikedItBetterProgress) {
  if (progress.completedAt) {
    return "completed";
  }

  return progress.startedAt ? "in-progress" : "none";
}
