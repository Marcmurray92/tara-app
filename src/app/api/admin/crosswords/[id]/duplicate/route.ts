import { NextResponse } from "next/server";

import { duplicateGameContent } from "@/features/content/game-content.repository";
import { requireAdminSession } from "@/lib/auth/admin-session";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdminSession();
  const record = await duplicateGameContent(params.id);

  return NextResponse.redirect(new URL(`/admin/crosswords/${record.id}`, request.url), {
    status: 303
  });
}
