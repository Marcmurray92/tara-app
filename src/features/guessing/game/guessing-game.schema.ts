import { z } from "zod";

const guessingChoiceSchema = z.object({
  id: z.string(),
  label: z.string().min(1)
});

const guessingQuestionSchema = z.object({
  id: z.string(),
  reviewText: z.string().min(1).optional(),
  reviewImage: z
    .object({
      src: z.string().min(1),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      alt: z.string().min(1)
    })
    .optional(),
  choices: z.tuple([
    guessingChoiceSchema,
    guessingChoiceSchema,
    guessingChoiceSchema,
    guessingChoiceSchema
  ]),
  correctChoiceId: z.string()
});

export const guessingGameSchema = z.object({
  schemaVersion: z.literal(1),
  questions: z.array(guessingQuestionSchema)
});

export const guessingAnswerRecordSchema = z.object({
  questionId: z.string().min(1),
  selectedChoiceId: z.string().min(1),
  correct: z.boolean()
});

export const guessingProgressSchema = z.object({
  schemaVersion: z.literal(1),
  currentQuestionIndex: z.number().int().min(0),
  answers: z.array(guessingAnswerRecordSchema),
  score: z.number().int().min(0),
  streak: z.number().int().min(0),
  bestStreak: z.number().int().min(0),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable()
});
