import { describe, expect, it } from "vitest";

import { placeholderGuessingGameData } from "@/features/guessing/seed/placeholder-guessing";
import { placeholderWhoLikedItBetterGameData } from "@/features/who-liked-it-better/seed/placeholder-who-liked-it-better";

describe("letterboxd-driven game seeds", () => {
  it("keeps movie review guess assets under the game-specific directories", () => {
    expect(placeholderGuessingGameData.rounds).toHaveLength(3);

    for (const round of placeholderGuessingGameData.rounds) {
      expect(round.reviewImage.src).toMatch(/^\/images\/games\/movie-review-guess\/reviews\/.+\.png$/);
      expect(round.choices).toHaveLength(4);

      for (const choice of round.choices) {
        expect(choice.posterImage?.src).toMatch(/^\/images\/games\/movie-review-guess\/posters\/.+\.svg$/);
      }
    }
  });

  it("keeps who liked it better poster assets under the comparison-game directories", () => {
    for (const question of placeholderWhoLikedItBetterGameData.questions) {
      expect(question.posterImage.src).toMatch(/^\/images\/games\/who-liked-it-better\/posters\/.+\.svg$/);

      if (question.sourceImage) {
        expect(question.sourceImage.src).toMatch(
          /^\/images\/games\/who-liked-it-better\/source-images\/.+\.(png|jpg|jpeg|webp|svg)$/
        );
      }
    }
  });

  it("ships the extended comparison set with the Kanye/source-image rounds intact", () => {
    expect(placeholderWhoLikedItBetterGameData.questions).toHaveLength(10);

    const inferredRounds = placeholderWhoLikedItBetterGameData.questions.filter(
      (question) => question.celebrityRatingConfidence === "low"
    );

    expect(inferredRounds).toHaveLength(3);
    expect(inferredRounds.every((question) => question.sourceImage)).toBe(true);
  });
});
