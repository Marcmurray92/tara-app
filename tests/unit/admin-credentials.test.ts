import { afterEach, describe, expect, it, vi } from "vitest";

const { safeReadServerEnv } = vi.hoisted(() => ({
  safeReadServerEnv: vi.fn()
}));

vi.mock("@/lib/environment/env", () => ({
  safeReadServerEnv
}));

import { verifyAdminCredentials } from "@/lib/auth/password";

describe("verifyAdminCredentials", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("accepts matching username and password", async () => {
    vi.useFakeTimers();
    safeReadServerEnv.mockReturnValue({
      success: true,
      data: {
        ADMIN_USERNAME: "marc",
        ADMIN_PASSWORD: "secret-pass"
      }
    });

    const pending = verifyAdminCredentials({
      username: "marc",
      password: "secret-pass"
    });

    await vi.advanceTimersByTimeAsync(700);

    await expect(pending).resolves.toBe(true);
  });

  it("rejects a valid password when the username is wrong", async () => {
    vi.useFakeTimers();
    safeReadServerEnv.mockReturnValue({
      success: true,
      data: {
        ADMIN_USERNAME: "marc",
        ADMIN_PASSWORD: "secret-pass"
      }
    });

    const pending = verifyAdminCredentials({
      username: "tara",
      password: "secret-pass"
    });

    await vi.advanceTimersByTimeAsync(700);

    await expect(pending).resolves.toBe(false);
  });
});
