import { z } from "zod";

const imageAssetSchema = z.object({
  src: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().min(1)
});

const questionSchema = z.object({
  id: z.string().min(1),
  movieTitle: z.string().min(1),
  movieSlug: z.string().min(1),
  year: z.number().int().positive().nullable().optional(),
  posterImage: imageAssetSchema,
  taraRating: z.number().min(0).max(5),
  celebrityName: z.string().min(1),
  celebrityImage: imageAssetSchema.nullable().optional(),
  celebrityImages: z.array(imageAssetSchema).optional(),
  celebrityRating: z.number().min(0).max(5),
  correctAnswer: z.enum(["tara", "celebrity"]),
  explanation: z.string().nullable().optional(),
  sourceImage: imageAssetSchema.nullable().optional(),
  sourceImages: z.array(imageAssetSchema).optional(),
  celebrityRatingSource: z.string().nullable().optional(),
  celebrityRatingConfidence: z.enum(["high", "medium", "low"]).optional()
});

export const whoLikedItBetterGameSchema = z.object({
  schemaVersion: z.literal(1),
  questions: z.array(questionSchema).min(1)
});

export const whoLikedItBetterAnswerRecordSchema = z.object({
  questionId: z.string().min(1),
  selectedAnswer: z.enum(["tara", "celebrity"]),
  correct: z.boolean(),
  answeredAt: z.string().min(1)
});

export const whoLikedItBetterProgressSchema = z.object({
  schemaVersion: z.literal(1),
  currentQuestionIndex: z.number().int().min(0),
  answers: z.array(whoLikedItBetterAnswerRecordSchema),
  score: z.number().int().min(0),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable()
});
