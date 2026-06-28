import { colourFieldGameSchema } from "@/features/colour-field/game/colour-field-game.schema";
import { connectionsGameSchema } from "@/features/connections/game/connections-game.schema";
import { connectionsSourceRowSchema } from "@/features/connections/source/connections-source.schema";
import { crosswordCompiledDataSchema } from "@/features/crossword/game/crossword-game.schema";
import { crosswordSourceDataSchema } from "@/features/crossword/source/crossword-source.schema";
import { guessingGameSchema } from "@/features/guessing/game/guessing-game.schema";
import { guessingSourceRowSchema } from "@/features/guessing/source/guessing-source.schema";
import type { GameType } from "@/features/games/game.types";
import { whoLikedItBetterGameSchema } from "@/features/who-liked-it-better/game/who-liked-it-better-game.schema";

export function validateSourceData(gameType: GameType, sourceData: unknown) {
  switch (gameType) {
    case "crossword":
      return crosswordSourceDataSchema.parse(sourceData);
    case "connections":
      return connectionsSourceRowSchema.array().parse(sourceData);
    case "guessing":
      return guessingSourceRowSchema.array().parse(sourceData);
    case "colour-field":
      return colourFieldGameSchema.parse(sourceData);
    case "who-liked-it-better":
      return sourceData;
  }
}

export function validateCompiledData(gameType: GameType, compiledData: unknown) {
  switch (gameType) {
    case "crossword":
      return crosswordCompiledDataSchema.parse(compiledData);
    case "connections":
      return connectionsGameSchema.parse(compiledData);
    case "guessing":
      return guessingGameSchema.parse(compiledData);
    case "colour-field":
      return colourFieldGameSchema.parse(compiledData);
    case "who-liked-it-better":
      return whoLikedItBetterGameSchema.parse(compiledData);
  }
}
