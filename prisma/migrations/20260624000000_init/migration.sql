-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('CROSSWORD', 'CONNECTIONS', 'GUESSING');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "GameContent" (
    "id" TEXT NOT NULL,
    "gameType" "GameType" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceSchemaVersion" INTEGER NOT NULL DEFAULT 1,
    "compiledSchemaVersion" INTEGER,
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "sourceData" JSONB NOT NULL,
    "compiledData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "GameContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameContent_gameType_status_idx" ON "GameContent"("gameType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GameContent_gameType_slug_key" ON "GameContent"("gameType", "slug");

