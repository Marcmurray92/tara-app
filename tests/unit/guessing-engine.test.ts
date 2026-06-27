import { describe, expect, it } from "vitest";

import {
  advanceGuessingRound,
  answerGuessingRound,
  createGuessingProgress,
  getCurrentGuessingRoundRecord,
  getGuessingChoiceOrder,
  getGuessingMistakesRemaining,
  retryCurrentGuessingRound
} from "@/features/guessing/game/guessing-engine";
import { placeholderGuessingGameData } from "@/features/guessing/seed/placeholder-guessing";

describe("guessing engine", () => {
  it("returns a stable shuffled order for a round", () => {
    const round = placeholderGuessingGameData.rounds[0];

    expect(getGuessingChoiceOrder(round)).toEqual(getGuessingChoiceOrder(round));
    expect(getGuessingChoiceOrder(round).map((choice) => choice.id).sort()).toEqual(
      round.choices.map((choice) => choice.id).sort()
    );
  });

  it("tracks mistakes and solves a round without resetting the run", () => {
    const progress = createGuessingProgress(placeholderGuessingGameData);

    const firstGuess = answerGuessingRound({
      gameData: placeholderGuessingGameData,
      progress,
      choiceId: "heathers",
      now: "2026-06-27T18:00:00.000Z"
    });

    expect(firstGuess.correct).toBe(false);
    expect(firstGuess.result).toBe("active");

    const firstRecord = getCurrentGuessingRoundRecord(placeholderGuessingGameData, firstGuess.progress);
    expect(firstRecord?.attemptedChoiceIds).toEqual(["heathers"]);
    expect(getGuessingMistakesRemaining(placeholderGuessingGameData.rounds[0], firstRecord!)).toBe(1);

    const solvedGuess = answerGuessingRound({
      gameData: placeholderGuessingGameData,
      progress: firstGuess.progress,
      choiceId: "mean-girls",
      now: "2026-06-27T18:02:00.000Z"
    });

    expect(solvedGuess.correct).toBe(true);
    expect(solvedGuess.result).toBe("solved");
    expect(solvedGuess.progress.completedAt).toBeNull();

    const nextProgress = advanceGuessingRound(placeholderGuessingGameData, solvedGuess.progress);
    expect(nextProgress.currentRoundIndex).toBe(1);
  });

  it("fails and retries the current round cleanly", () => {
    const progress = createGuessingProgress(placeholderGuessingGameData);

    const firstMiss = answerGuessingRound({
      gameData: placeholderGuessingGameData,
      progress,
      choiceId: "heathers",
      now: "2026-06-27T18:10:00.000Z"
    });

    const failedRound = answerGuessingRound({
      gameData: placeholderGuessingGameData,
      progress: firstMiss.progress,
      choiceId: "clueless",
      now: "2026-06-27T18:11:00.000Z"
    });

    expect(failedRound.correct).toBe(false);
    expect(failedRound.result).toBe("failed");

    const retried = retryCurrentGuessingRound(placeholderGuessingGameData, failedRound.progress);
    const currentRecord = getCurrentGuessingRoundRecord(placeholderGuessingGameData, retried);

    expect(currentRecord?.attemptedChoiceIds).toEqual([]);
    expect(currentRecord?.result).toBe("active");
  });

  it("marks the full game complete after the hard round is solved", () => {
    let progress = createGuessingProgress(placeholderGuessingGameData);

    progress = answerGuessingRound({
      gameData: placeholderGuessingGameData,
      progress,
      choiceId: "mean-girls",
      now: "2026-06-27T18:20:00.000Z"
    }).progress;
    progress = advanceGuessingRound(placeholderGuessingGameData, progress);

    progress = answerGuessingRound({
      gameData: placeholderGuessingGameData,
      progress,
      choiceId: "arrival",
      now: "2026-06-27T18:21:00.000Z"
    }).progress;
    progress = advanceGuessingRound(placeholderGuessingGameData, progress);

    const finalRound = answerGuessingRound({
      gameData: placeholderGuessingGameData,
      progress,
      choiceId: "american-beauty",
      now: "2026-06-27T18:22:00.000Z"
    });

    expect(finalRound.correct).toBe(true);
    expect(finalRound.progress.completedAt).toBe("2026-06-27T18:22:00.000Z");
  });
});
