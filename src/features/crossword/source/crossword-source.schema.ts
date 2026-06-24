import { z } from "zod";

export const crosswordSourceRowSchema = z.object({
  id: z.string(),
  sourceRowNumber: z.number().int().positive(),
  clue: z.string(),
  answer: z.string(),
  category: z.string().optional(),
  gridAnswer: z.string().optional(),
  status: z.enum(["complete", "incomplete", "invalid"]),
  issues: z.array(
    z.object({
      rowNumber: z.number().int().positive().optional(),
      column: z.string().optional(),
      severity: z.enum(["warning", "error"]),
      code: z.string(),
      message: z.string()
    })
  )
});

export const crosswordSourceImportMetadataSchema = z.object({
  detectedHeaders: z.array(z.string()),
  unknownHeaders: z.array(z.string()),
  ignoredBlankRows: z.number().int().nonnegative()
});

export const crosswordSourceAuthoringStateSchema = z.object({
  selectedRowIds: z.array(z.string()),
  seed: z.string(),
  completion: z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    actionLabel: z.string().optional(),
    actionHref: z.string().optional()
  }),
  importMetadata: crosswordSourceImportMetadataSchema.optional()
});

export const crosswordSourceDataEnvelopeSchema = z.object({
  schemaVersion: z.literal(1),
  rows: z.array(crosswordSourceRowSchema),
  authoring: crosswordSourceAuthoringStateSchema.optional()
});

export const legacyCrosswordSourceDataSchema = z.array(crosswordSourceRowSchema);

export const crosswordSourceDataSchema = z.union([
  legacyCrosswordSourceDataSchema,
  crosswordSourceDataEnvelopeSchema
]);
