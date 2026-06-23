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

