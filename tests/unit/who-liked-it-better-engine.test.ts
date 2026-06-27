import { describe, expect, it } from "vitest";

import {
  advanceWhoLikedItBetterQuestion,
  answerWhoLikedItBetterQuestion,
  createWhoLikedItBetterProgress,
  getCurrentWhoLikedItBetterQuestion,
  getWhoLikedItBetterAnswerRecord
} from "@/features/who-liked-it-better/game/who-liked-it-better-engine";
import { placeholderWhoLikedItBetterGameData } from "@/features/who-liked-it-better/seed/placeholder-who-liked-it-better";

describe("who liked it better engine", () => {
  it("starts on the first question", () => {
    const progress = createWhoLikedItBetterProgress();

    expect(getCurrentWhoLikedItBetterQuestion(placeholderWhoLikedItBetterGameData, progress)?.id).toBe(
      placeholderWhoLikedItBetterGameData.questions[0]?.id
    );
  });

  it("records an answer and advances", () => {
    const progress = createWhoLikedItBetterProgress();
    const firstQuestion = placeholderWhoLikedItBetterGameData.questions[0];

    if (!firstQuestion) {
      throw new Error("Expected seeded question.");
    }

    const answered = answerWhoLikedItBetterQuestion({
      gameData: placeholderWhoLikedItBetterGameData,
      progress,
      selectedAnswer: firstQuestion.correctAnswer,
      now: "2026-06-27T19:00:00.000Z"
    });

    expect(answered.correct).toBe(true);
    expect(answered.progress.score).toBe(1);
    expect(getWhoLikedItBetterAnswerRecord(answered.progress, firstQuestion.id)?.selectedAnswer).toBe(
      firstQuestion.correctAnswer
    );

    const advanced = advanceWhoLikedItBetterQuestion(placeholderWhoLikedItBetterGameData, answered.progress);
    expect(advanced.currentQuestionIndex).toBe(1);
  });

  it("marks the run complete after the final answer", () => {
    let progress = createWhoLikedItBetterProgress();

    for (const question of placeholderWhoLikedItBetterGameData.questions) {
      progress = answerWhoLikedItBetterQuestion({
        gameData: placeholderWhoLikedItBetterGameData,
        progress,
        selectedAnswer: question.correctAnswer,
        now: "2026-06-27T19:05:00.000Z"
      }).progress;

      if (!progress.completedAt) {
        progress = advanceWhoLikedItBetterQuestion(placeholderWhoLikedItBetterGameData, progress);
      }
    }

    expect(progress.completedAt).toBe("2026-06-27T19:05:00.000Z");
    expect(progress.score).toBe(placeholderWhoLikedItBetterGameData.questions.length);
  });
});
