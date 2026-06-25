import { describe, expect, it } from "vitest";

import {
  advanceGuessingQuestion,
  answerGuessingQuestion,
  createGuessingProgress,
  getGuessingChoiceOrder
} from "@/features/guessing/game/guessing-engine";
import { placeholderGuessingGameData } from "@/features/guessing/seed/placeholder-guessing";

describe("guessing engine", () => {
  it("returns a stable shuffled order for a question", () => {
    const question = placeholderGuessingGameData.questions[0];

    expect(getGuessingChoiceOrder(question)).toEqual(getGuessingChoiceOrder(question));
    expect(getGuessingChoiceOrder(question).map((choice) => choice.id).sort()).toEqual(
      question.choices.map((choice) => choice.id).sort()
    );
  });

  it("tracks score, streak, and completion across a round", () => {
    const gameData = {
      ...placeholderGuessingGameData,
      questions: placeholderGuessingGameData.questions.slice(0, 2)
    };

    const first = answerGuessingQuestion({
      gameData,
      progress: createGuessingProgress(),
      choiceId: "mean-girls",
      now: "2026-06-24T10:00:00.000Z"
    });

    expect(first.correct).toBe(true);
    expect(first.progress.score).toBe(1);
    expect(first.progress.streak).toBe(1);

    const second = answerGuessingQuestion({
      gameData,
      progress: advanceGuessingQuestion(gameData, first.progress),
      choiceId: "possession",
      now: "2026-06-24T10:05:00.000Z"
    });

    expect(second.correct).toBe(false);
    expect(second.progress.score).toBe(1);
    expect(second.progress.bestStreak).toBe(1);
    expect(second.progress.completedAt).toBe("2026-06-24T10:05:00.000Z");
  });
});
