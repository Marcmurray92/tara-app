import { NextResponse } from "next/server";

import { archiveGameContent } from "@/features/content/game-content.repository";
import { requireAdminSession } from "@/lib/auth/admin-session";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdminSession();
  await archiveGameContent(params.id);

  return NextResponse.redirect(new URL(`/admin/crosswords/${params.id}`, request.url), {
    status: 303
  });
}

