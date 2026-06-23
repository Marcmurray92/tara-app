import { z } from "zod";

export const crosswordDirectionSchema = z.union([z.literal("across"), z.literal("down")]);

export const crosswordCompiledCellSchema = z.object({
  row: z.number().int().nonnegative(),
  column: z.number().int().nonnegative(),
  solution: z.string().length(1).nullable(),
  number: z.number().int().positive().optional(),
  acrossEntryId: z.string().optional(),
  downEntryId: z.string().optional(),
  circle: z.boolean().optional()
});

export const crosswordCompiledEntrySchema = z.object({
  id: z.string(),
  sourceRowNumber: z.number().int().positive().optional(),
  number: z.number().int().positive(),
  direction: crosswordDirectionSchema,
  clue: z.string().min(1),
  answer: z.string().min(2),
  displayAnswer: z.string().min(1),
  category: z.string().optional(),
  startRow: z.number().int().nonnegative(),
  startColumn: z.number().int().nonnegative(),
  length: z.number().int().positive()
});

export const crosswordCompiledDataSchema = z.object({
  schemaVersion: z.literal(1),
  rows: z.number().int().positive(),
  columns: z.number().int().positive(),
  cells: z.array(z.array(crosswordCompiledCellSchema)),
  entries: z.array(crosswordCompiledEntrySchema),
  generation: z.object({
    seed: z.string(),
    attemptedEntryIds: z.array(z.string()),
    placedEntryIds: z.array(z.string()),
    unplacedEntryIds: z.array(z.string()),
    generatedAt: z.string(),
    algorithmVersion: z.number().int().positive()
  }),
  completion: z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    actionLabel: z.string().optional(),
    actionHref: z.string().optional()
  })
});

export const crosswordProgressSchema = z.object({
  schemaVersion: z.literal(1),
  cells: z.array(
    z.array(
      z.object({
        value: z.string(),
        checkedIncorrect: z.boolean(),
        revealed: z.boolean()
      })
    )
  ),
  selection: z
    .object({
      row: z.number().int().nonnegative(),
      column: z.number().int().nonnegative(),
      direction: crosswordDirectionSchema
    })
    .nullable(),
  startedAt: z.string().nullable(),
  elapsedMilliseconds: z.number().int().nonnegative(),
  completedAt: z.string().nullable()
});

