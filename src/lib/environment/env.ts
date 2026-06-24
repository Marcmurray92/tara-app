import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Tara's 30th")
});

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Tara's 30th")
});

export function readPublicEnv() {
  return publicEnvSchema.parse(process.env);
}

export function readServerEnv() {
  return serverEnvSchema.parse(process.env);
}

export function safeReadServerEnv() {
  return serverEnvSchema.safeParse(process.env);
}
