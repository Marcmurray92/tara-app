import { z } from "zod";

export const connectionsGroupSchema = z.object({
  id: z.string(),
  category: z.string().min(1),
  items: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional()
});

export const connectionsGameSchema = z.object({
  schemaVersion: z.literal(1),
  groups: z.tuple([
    connectionsGroupSchema,
    connectionsGroupSchema,
    connectionsGroupSchema,
    connectionsGroupSchema
  ])
});

export const connectionsGuessRecordSchema = z.object({
  tileIds: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
  outcome: z.union([z.literal("solved"), z.literal("one-away"), z.literal("miss"), z.literal("lost")]),
  submittedAt: z.string().min(1)
});

export const connectionsProgressSchema = z.object({
  schemaVersion: z.literal(2),
  selectedItemIds: z.array(z.string().min(1)),
  solvedGroupIds: z.array(z.string().min(1)),
  guessHistory: z.array(connectionsGuessRecordSchema),
  remainingTileIds: z.array(z.string().min(1)),
  mistakes: z.number().int().min(0).max(4),
  shuffleSeed: z.number().int().min(0),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  status: z.union([z.literal("playing"), z.literal("won"), z.literal("lost")])
});
