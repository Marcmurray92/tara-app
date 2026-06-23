import { timingSafeEqual } from "node:crypto";

import { safeReadServerEnv } from "@/lib/environment/env";

function toBuffer(value: string) {
  return Buffer.from(value.normalize("NFKC"));
}

export async function verifyAdminPassword(input: string) {
  const env = safeReadServerEnv();
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (!env.success) {
    return false;
  }

  const expected = toBuffer(env.data.ADMIN_PASSWORD);
  const received = toBuffer(input);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

