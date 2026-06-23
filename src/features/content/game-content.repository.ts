import { Prisma, type GameContent } from "@prisma/client";

import type { ContentStatus, GameContentRecord } from "@/features/content/content.types";
import { validateCompiledData, validateSourceData } from "@/features/content/content-validation";
import type { GameType } from "@/features/games/game.types";
import { prisma } from "@/lib/database/prisma";

function toPrismaGameType(gameType: GameType) {
  return gameType.toUpperCase() as "CROSSWORD" | "CONNECTIONS" | "GUESSING";
}

function fromPrismaGameType(gameType: "CROSSWORD" | "CONNECTIONS" | "GUESSING"): GameType {
  return gameType.toLowerCase() as GameType;
}

function toPrismaStatus(status: ContentStatus) {
  return status.toUpperCase() as "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

function fromPrismaStatus(status: "DRAFT" | "PUBLISHED" | "ARCHIVED"): ContentStatus {
  return status.toLowerCase() as ContentStatus;
}

function mapRecord(record: GameContent): GameContentRecord {
  const gameType = fromPrismaGameType(record.gameType);
  validateSourceData(gameType, record.sourceData);
  if (record.compiledData) {
    validateCompiledData(gameType, record.compiledData);
  }

  return {
    id: record.id,
    gameType,
    slug: record.slug,
    title: record.title,
    subtitle: record.subtitle,
    description: record.description,
    status: fromPrismaStatus(record.status),
    sourceSchemaVersion: record.sourceSchemaVersion,
    compiledSchemaVersion: record.compiledSchemaVersion,
    contentVersion: record.contentVersion,
    sourceData: record.sourceData,
    compiledData: record.compiledData ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    publishedAt: record.publishedAt?.toISOString()
  };
}

export async function listGameContent() {
  const records = await prisma.gameContent.findMany({
    orderBy: {
      updatedAt: "desc"
    }
  });

  return records.map((record) => mapRecord(record));
}

export async function getGameContentById(id: string) {
  const record = await prisma.gameContent.findUnique({
    where: { id }
  });

  return record
    ? mapRecord(record)
    : null;
}

export async function getPublishedGameContentBySlug(gameType: GameType, slug: string) {
  const record = await prisma.gameContent.findFirst({
    where: {
      gameType: toPrismaGameType(gameType),
      slug,
      status: "PUBLISHED"
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return record ? mapRecord(record) : null;
}

function toJsonValue(value: unknown) {
  return value as Prisma.InputJsonValue;
}

export async function upsertGameContent({
  gameType,
  slug,
  title,
  subtitle,
  description,
  status,
  sourceData,
  compiledData
}: {
  gameType: GameType;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  status: ContentStatus;
  sourceData: unknown;
  compiledData?: unknown;
}) {
  validateSourceData(gameType, sourceData);
  if (compiledData) {
    validateCompiledData(gameType, compiledData);
  }

  const existing = await prisma.gameContent.findUnique({
    where: {
      gameType_slug: {
        gameType: toPrismaGameType(gameType),
        slug
      }
    }
  });

  const compiledChanged =
    JSON.stringify(existing?.compiledData ?? null) !== JSON.stringify(compiledData ?? null);

  const record = await prisma.gameContent.upsert({
    where: {
      gameType_slug: {
        gameType: toPrismaGameType(gameType),
        slug
      }
    },
    create: {
      gameType: toPrismaGameType(gameType),
      slug,
      title,
      subtitle,
      description,
      status: toPrismaStatus(status),
      sourceSchemaVersion: 1,
      compiledSchemaVersion: compiledData ? 1 : null,
      contentVersion: 1,
      sourceData: toJsonValue(sourceData),
      compiledData: compiledData ? toJsonValue(compiledData) : Prisma.JsonNull,
      publishedAt: status === "published" ? new Date() : null
    },
    update: {
      title,
      subtitle,
      description,
      status: toPrismaStatus(status),
      sourceSchemaVersion: 1,
      compiledSchemaVersion: compiledData ? 1 : null,
      contentVersion: existing ? (compiledChanged ? existing.contentVersion + 1 : existing.contentVersion) : 1,
      sourceData: toJsonValue(sourceData),
      compiledData: compiledData ? toJsonValue(compiledData) : Prisma.JsonNull,
      publishedAt: status === "published" ? new Date() : existing?.publishedAt ?? null
    }
  });

  return mapRecord(record);
}

export async function archiveGameContent(id: string) {
  const record = await prisma.gameContent.update({
    where: { id },
    data: {
      status: "ARCHIVED"
    }
  });

  return mapRecord(record);
}
