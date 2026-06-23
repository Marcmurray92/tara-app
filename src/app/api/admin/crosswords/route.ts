import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminSession } from "@/lib/auth/admin-session";
import { saveGameContent } from "@/features/content/game-content.repository";

const requestSchema = z.object({
  contentId: z.string().min(1).optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  status: z.union([z.literal("draft"), z.literal("published")]),
  sourceData: z.unknown(),
  compiledData: z.unknown().optional()
});

export async function POST(request: Request) {
  await requireAdminSession();

  try {
    const body = requestSchema.parse(await request.json());
    const record = await saveGameContent({
      contentId: body.contentId,
      gameType: "crossword",
      slug: body.slug,
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      status: body.status,
      sourceData: body.sourceData,
      compiledData: body.compiledData
    });

    return NextResponse.json({
      ok: true,
      record
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unable to save crossword content."
      },
      {
        status: 400
      }
    );
  }
}
