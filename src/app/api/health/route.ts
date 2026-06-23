import { NextResponse } from "next/server";

import { prisma } from "@/lib/database/prisma";
import { safeReadServerEnv } from "@/lib/environment/env";

export async function GET() {
  const env = safeReadServerEnv();
  if (!env.success || !env.data.DATABASE_URL) {
    return NextResponse.json(
      {
        status: "unavailable",
        database: "disconnected"
      },
      { status: 503 }
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "connected"
    });
  } catch {
    return NextResponse.json(
      {
        status: "unavailable",
        database: "disconnected"
      },
      { status: 503 }
    );
  }
}

