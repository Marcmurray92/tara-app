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

export async function getLatestPublishedGameContent(gameType: GameType) {
  const record = await prisma.gameContent.findFirst({
    where: {
      gameType: toPrismaGameType(gameType),
      status: "PUBLISHED"
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }]
  });

  return record ? mapRecord(record) : null;
}

export async function listPublishedGameContent(gameType: GameType) {
  const records = await prisma.gameContent.findMany({
    where: {
      gameType: toPrismaGameType(gameType),
      status: "PUBLISHED"
    },
    orderBy: [{ slug: "asc" }, { publishedAt: "asc" }, { updatedAt: "asc" }]
  });

  return records.map((record) => mapRecord(record));
}

function toJsonValue(value: unknown) {
  return value as Prisma.InputJsonValue;
}

async function assertUniqueGameSlug({
  gameType,
  slug,
  excludeId
}: {
  gameType: GameType;
  slug: string;
  excludeId?: string;
}) {
  const existing = await prisma.gameContent.findFirst({
    where: {
      gameType: toPrismaGameType(gameType),
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {})
    }
  });

  if (existing) {
    throw new Error(`Another ${gameType} record already uses the slug "${slug}".`);
  }
}

async function getNextDuplicateSlug(gameType: GameType, sourceSlug: string) {
  const baseSlug = `${sourceSlug}-copy`;
  let counter = 1;

  while (true) {
    const candidate = counter === 1 ? baseSlug : `${baseSlug}-${counter}`;
    const existing = await prisma.gameContent.findFirst({
      where: {
        gameType: toPrismaGameType(gameType),
        slug: candidate
      }
    });

    if (!existing) {
      return candidate;
    }

    counter += 1;
  }
}

export async function saveGameContent({
  contentId,
  gameType,
  slug,
  title,
  subtitle,
  description,
  status,
  sourceData,
  compiledData
}: {
  contentId?: string;
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

  if (contentId) {
    const existing = await prisma.gameContent.findUnique({
      where: { id: contentId }
    });

    if (!existing) {
      throw new Error("Content record not found.");
    }

    if (fromPrismaGameType(existing.gameType) !== gameType) {
      throw new Error("Game type mismatch for this content record.");
    }

    await assertUniqueGameSlug({
      gameType,
      slug,
      excludeId: contentId
    });

    const sourceChanged =
      JSON.stringify(existing.sourceData ?? null) !== JSON.stringify(sourceData ?? null);
    const compiledChanged =
      JSON.stringify(existing.compiledData ?? null) !== JSON.stringify(compiledData ?? null);

    const record = await prisma.gameContent.update({
      where: { id: contentId },
      data: {
        slug,
        title,
        subtitle,
        description,
        status: toPrismaStatus(status),
        sourceSchemaVersion: 1,
        compiledSchemaVersion: compiledData ? 1 : null,
        contentVersion: sourceChanged || compiledChanged ? existing.contentVersion + 1 : existing.contentVersion,
        sourceData: toJsonValue(sourceData),
        compiledData: compiledData ? toJsonValue(compiledData) : Prisma.JsonNull,
        publishedAt: status === "published" ? new Date() : null
      }
    });

    return mapRecord(record);
  }

  await assertUniqueGameSlug({
    gameType,
    slug
  });

  const record = await prisma.gameContent.create({
    data: {
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
    }
  });

  return mapRecord(record);
}

export async function duplicateGameContent(id: string) {
  const existing = await prisma.gameContent.findUnique({
    where: { id }
  });

  if (!existing) {
    throw new Error("Content record not found.");
  }

  const gameType = fromPrismaGameType(existing.gameType);
  validateSourceData(gameType, existing.sourceData);
  if (existing.compiledData) {
    validateCompiledData(gameType, existing.compiledData);
  }

  const duplicateSlug = await getNextDuplicateSlug(gameType, existing.slug);
  const duplicateTitle = existing.title.includes("Copy") ? existing.title : `${existing.title} (Copy)`;

  const duplicate = await prisma.gameContent.create({
    data: {
      gameType: existing.gameType,
      slug: duplicateSlug,
      title: duplicateTitle,
      subtitle: existing.subtitle,
      description: existing.description,
      status: "DRAFT",
      sourceSchemaVersion: existing.sourceSchemaVersion,
      compiledSchemaVersion: existing.compiledSchemaVersion,
      contentVersion: 1,
      sourceData: toJsonValue(existing.sourceData),
      compiledData: existing.compiledData ? toJsonValue(existing.compiledData) : Prisma.JsonNull,
      publishedAt: null
    }
  });

  return mapRecord(duplicate);
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
