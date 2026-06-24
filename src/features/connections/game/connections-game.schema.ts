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

export const connectionsProgressSchema = z.object({
  schemaVersion: z.literal(1),
  selectedItemIds: z.array(z.string().min(1)),
  solvedGroupIds: z.array(z.string().min(1)),
  submittedGuesses: z.array(z.string().min(1)),
  remainingTileIds: z.array(z.string().min(1)),
  mistakes: z.number().int().min(0).max(4),
  shuffleSeed: z.number().int().min(0),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  status: z.union([z.literal("playing"), z.literal("won"), z.literal("lost")])
});
