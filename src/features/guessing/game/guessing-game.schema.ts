import { z } from "zod";

const guessingChoiceSchema = z.object({
  id: z.string(),
  label: z.string().min(1)
});

const guessingQuestionSchema = z.object({
  id: z.string(),
  reviewText: z.string().min(1),
  choices: z.tuple([
    guessingChoiceSchema,
    guessingChoiceSchema,
    guessingChoiceSchema,
    guessingChoiceSchema
  ]),
  correctChoiceId: z.string()
});

export const guessingGameSchema = z.object({
  schemaVersion: z.literal(1),
  questions: z.array(guessingQuestionSchema)
});

