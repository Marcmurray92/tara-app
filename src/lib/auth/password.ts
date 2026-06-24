import { timingSafeEqual } from "node:crypto";

import { safeReadServerEnv } from "@/lib/environment/env";

function toBuffer(value: string) {
  return Buffer.from(value.normalize("NFKC"));
}

function safeCompare(received: string, expected: string) {
  const expectedBuffer = toBuffer(expected);
  const receivedBuffer = toBuffer(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function verifyAdminCredentials({
  username,
  password
}: {
  username: string;
  password: string;
}) {
  const env = safeReadServerEnv();
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (!env.success) {
    return false;
  }

  const usernameValid = safeCompare(username.trim(), env.data.ADMIN_USERNAME);
  const passwordValid = safeCompare(password, env.data.ADMIN_PASSWORD);

  return usernameValid && passwordValid;
}
