import { z } from "zod";

export const colourFieldLevelSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  columns: z.number().int().min(2),
  rows: z.number().int().min(2),
  fixedTileIndexes: z.array(z.number().int().min(0)),
  palette: z.object({
    topLeft: z.string().min(4),
    topRight: z.string().min(4),
    bottomLeft: z.string().min(4),
    bottomRight: z.string().min(4)
  }),
  previewDurationMs: z.number().int().min(0),
  seed: z.string().min(1)
});

export const colourFieldGameSchema = z.object({
  schemaVersion: z.number().int().min(1),
  introLine: z.string().min(1),
  completionLines: z.array(z.string().min(1)).min(1),
  levels: z.array(colourFieldLevelSchema).min(1)
});

export const colourFieldLevelProgressSchema = z.object({
  unlocked: z.boolean(),
  attemptCount: z.number().int().min(0),
  bestMoves: z.number().int().min(0).nullable(),
  lastMoves: z.number().int().min(0).nullable(),
  currentMoves: z.number().int().min(0),
  currentOrder: z.array(z.number().int().min(0)).nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable()
});

export const colourFieldProgressSchema = z.object({
  activeLevelSlug: z.string().nullable(),
  completedAt: z.string().nullable(),
  levels: z.record(colourFieldLevelProgressSchema)
});
