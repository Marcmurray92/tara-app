import type {
  GuessingChoice,
  GuessingGameData,
  GuessingProgress,
  GuessingQuestion
} from "@/features/guessing/game/guessing-game.types";

function hashValue(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return hash >>> 0;
}

export function createGuessingProgress(): GuessingProgress {
  return {
    schemaVersion: 1,
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
    startedAt: null,
    completedAt: null
  };
}

export function getGuessingChoiceOrder(question: GuessingQuestion): GuessingChoice[] {
  return [...question.choices].sort((left, right) => {
    const leftScore = hashValue(`${question.id}:${left.id}`);
    const rightScore = hashValue(`${question.id}:${right.id}`);

    if (leftScore === rightScore) {
      return left.id.localeCompare(right.id);
    }

    return leftScore - rightScore;
  });
}

export function getCurrentGuessingQuestion(gameData: GuessingGameData, progress: GuessingProgress) {
  return gameData.questions[progress.currentQuestionIndex] ?? null;
}

export function answerGuessingQuestion({
  gameData,
  progress,
  choiceId,
  now
}: {
  gameData: GuessingGameData;
  progress: GuessingProgress;
  choiceId: string;
  now: string;
}) {
  const question = getCurrentGuessingQuestion(gameData, progress);

  if (!question || progress.completedAt || progress.answers.some((answer) => answer.questionId === question.id)) {
    return {
      progress,
      correct: false
    };
  }

  const correct = question.correctChoiceId === choiceId;
  const streak = correct ? progress.streak + 1 : 0;
  const answers = [
    ...progress.answers,
    {
      questionId: question.id,
      selectedChoiceId: choiceId,
      correct
    }
  ];
  const complete = answers.length === gameData.questions.length;

  return {
    progress: {
      ...progress,
      answers,
      score: progress.score + (correct ? 1 : 0),
      streak,
      bestStreak: Math.max(progress.bestStreak, streak),
      startedAt: progress.startedAt ?? now,
      completedAt: complete ? now : null
    },
    correct
  };
}

export function advanceGuessingQuestion(gameData: GuessingGameData, progress: GuessingProgress) {
  const question = getCurrentGuessingQuestion(gameData, progress);

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

export function getGuessingAnswerRecord(progress: GuessingProgress, questionId: string) {
  return progress.answers.find((answer) => answer.questionId === questionId) ?? null;
}

export function getGuessingStatusSummary(progress: GuessingProgress) {
  if (progress.completedAt) {
    return "completed";
  }

  return progress.startedAt ? "in-progress" : "none";
}
