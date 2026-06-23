import { z } from "zod";

export const connectionsSourceRowSchema = z.object({
  id: z.string(),
  sourceRowNumber: z.number().int().positive(),
  category: z.string(),
  movies: z.array(z.string()).min(0).max(4),
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

