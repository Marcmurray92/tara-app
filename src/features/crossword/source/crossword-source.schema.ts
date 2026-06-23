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

export const crosswordSourceDataSchema = z.array(crosswordSourceRowSchema);

