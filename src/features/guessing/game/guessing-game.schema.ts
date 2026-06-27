import { z } from "zod";

const guessingImageAssetSchema = z.object({
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().min(1)
});

const guessingChoiceSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  year: z.number().int().positive().optional(),
  posterImage: guessingImageAssetSchema.optional()
});

const guessingRoundSchema = z.object({
  id: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  reviewImage: guessingImageAssetSchema,
  choices: z.tuple([
    guessingChoiceSchema,
    guessingChoiceSchema,
    guessingChoiceSchema,
    guessingChoiceSchema
  ]),
  correctChoiceId: z.string(),
  celebrationQuote: z.string().nullable().optional()
});

export const guessingGameSchema = z.object({
  schemaVersion: z.literal(2),
  rounds: z.tuple([guessingRoundSchema, guessingRoundSchema, guessingRoundSchema])
});

export const guessingRoundRecordSchema = z.object({
  roundId: z.string().min(1),
  attemptedChoiceIds: z.array(z.string().min(1)),
  result: z.enum(["active", "solved", "failed"]),
  completedAt: z.string().nullable()
});

export const guessingProgressSchema = z.object({
  schemaVersion: z.literal(2),
  currentRoundIndex: z.number().int().min(0),
  roundRecords: z.array(guessingRoundRecordSchema),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable()
});
