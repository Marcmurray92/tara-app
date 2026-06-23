import { z } from "zod";

export const guessingSourceRowSchema = z.object({
  id: z.string(),
  sourceRowNumber: z.number().int().positive(),
  rightAnswer: z.string(),
  answer2: z.string(),
  answer3: z.string(),
  answer4: z.string(),
  letterboxdReviews: z.string(),
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

