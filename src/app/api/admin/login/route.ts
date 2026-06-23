import { NextResponse } from "next/server";

import { createAdminSession } from "@/lib/auth/admin-session";
import { verifyAdminPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const valid = await verifyAdminPassword(password);

  if (!valid) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), {
      status: 303
    });
  }

  await createAdminSession();

  return NextResponse.redirect(new URL("/admin", request.url), {
    status: 303
  });
}

