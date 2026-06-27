import type {
  GuessingChoice,
  GuessingGameData,
  GuessingProgress,
  GuessingRound,
  GuessingRoundResult
} from "@/features/guessing/game/guessing-game.types";

const MAX_GUESSING_MISTAKES = 2;

function hashValue(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return hash >>> 0;
}

function getWrongAttemptIds(round: GuessingRound, attemptedChoiceIds: string[]) {
  return attemptedChoiceIds.filter((choiceId) => choiceId !== round.correctChoiceId);
}

export function createGuessingProgress(gameData: GuessingGameData): GuessingProgress {
  return {
    schemaVersion: 2,
    currentRoundIndex: 0,
    roundRecords: gameData.rounds.map((round) => ({
      roundId: round.id,
      attemptedChoiceIds: [],
      result: "active",
      completedAt: null
    })),
    startedAt: null,
    completedAt: null
  };
}

export function getGuessingChoiceOrder(round: GuessingRound): GuessingChoice[] {
  return [...round.choices].sort((left, right) => {
    const leftScore = hashValue(`${round.id}:${left.id}`);
    const rightScore = hashValue(`${round.id}:${right.id}`);

    if (leftScore === rightScore) {
      return left.id.localeCompare(right.id);
    }

    return leftScore - rightScore;
  });
}

export function getCurrentGuessingRound(gameData: GuessingGameData, progress: GuessingProgress) {
  return gameData.rounds[progress.currentRoundIndex] ?? null;
}

export function getCurrentGuessingRoundRecord(gameData: GuessingGameData, progress: GuessingProgress) {
  const round = getCurrentGuessingRound(gameData, progress);

  if (!round) {
    return null;
  }

  return progress.roundRecords.find((record) => record.roundId === round.id) ?? null;
}

export function getGuessingMistakesRemaining(
  round: GuessingRound,
  progressRecord: {
    attemptedChoiceIds: string[];
  }
) {
  return Math.max(0, MAX_GUESSING_MISTAKES - getWrongAttemptIds(round, progressRecord.attemptedChoiceIds).length);
}

export function answerGuessingRound({
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
  const round = getCurrentGuessingRound(gameData, progress);
  const record = getCurrentGuessingRoundRecord(gameData, progress);

  if (!round || !record || progress.completedAt || record.result !== "active" || record.attemptedChoiceIds.includes(choiceId)) {
    return {
      progress,
      correct: false,
      result: record?.result ?? "active"
    };
  }

  const correct = round.correctChoiceId === choiceId;
  const attemptedChoiceIds = [...record.attemptedChoiceIds, choiceId];
  const mistakesRemaining = getGuessingMistakesRemaining(round, { attemptedChoiceIds });
  const result: GuessingRoundResult = correct ? "solved" : mistakesRemaining === 0 ? "failed" : "active";
  const roundRecords: GuessingProgress["roundRecords"] = progress.roundRecords.map((existingRecord) =>
    existingRecord.roundId === round.id
      ? {
          ...existingRecord,
          attemptedChoiceIds,
          result,
          completedAt: result === "active" ? null : now
        }
      : existingRecord
  );
  const completed = correct && progress.currentRoundIndex === gameData.rounds.length - 1;

  return {
    progress: {
      ...progress,
      roundRecords,
      startedAt: progress.startedAt ?? now,
      completedAt: completed ? now : null
    },
    correct,
    result
  };
}

export function advanceGuessingRound(gameData: GuessingGameData, progress: GuessingProgress) {
  const record = getCurrentGuessingRoundRecord(gameData, progress);

  if (!record || progress.completedAt || record.result !== "solved") {
    return progress;
  }

  if (progress.currentRoundIndex >= gameData.rounds.length - 1) {
    return progress;
  }

  return {
    ...progress,
    currentRoundIndex: Math.min(progress.currentRoundIndex + 1, gameData.rounds.length - 1)
  };
}

export function retryCurrentGuessingRound(gameData: GuessingGameData, progress: GuessingProgress) {
  const round = getCurrentGuessingRound(gameData, progress);

  if (!round) {
    return progress;
  }

  return {
    ...progress,
    completedAt: null,
    roundRecords: progress.roundRecords.map((record) =>
      record.roundId === round.id
        ? {
            ...record,
            attemptedChoiceIds: [],
            result: "active" as GuessingRoundResult,
            completedAt: null
          }
        : record
    )
  };
}

export function getGuessingStatusSummary(progress: GuessingProgress) {
  if (progress.completedAt) {
    return "completed";
  }

  return progress.startedAt ? "in-progress" : "none";
}
