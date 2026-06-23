import { PrismaClient } from "@prisma/client";

import {
  placeholderCrosswordCompiledData,
  placeholderCrosswordSourceRows
} from "../src/features/crossword/seed/placeholder-crossword";

const prisma = new PrismaClient();

async function main() {
  await prisma.gameContent.upsert({
    where: {
      gameType_slug: {
        gameType: "CROSSWORD",
        slug: "taras-birthday-crossword"
      }
    },
    create: {
      gameType: "CROSSWORD",
      slug: "taras-birthday-crossword",
      title: "Tara's Birthday Crossword",
      subtitle: "Placeholder content for Phase 1",
      description: "Seeded placeholder crossword content that can be replaced later with final birthday clues.",
      status: "PUBLISHED",
      sourceSchemaVersion: 1,
      compiledSchemaVersion: 1,
      contentVersion: 1,
      sourceData: placeholderCrosswordSourceRows,
      compiledData: placeholderCrosswordCompiledData,
      publishedAt: new Date()
    },
    update: {
      title: "Tara's Birthday Crossword",
      subtitle: "Placeholder content for Phase 1",
      description: "Seeded placeholder crossword content that can be replaced later with final birthday clues.",
      status: "PUBLISHED",
      sourceSchemaVersion: 1,
      compiledSchemaVersion: 1,
      contentVersion: 1,
      sourceData: placeholderCrosswordSourceRows,
      compiledData: placeholderCrosswordCompiledData,
      publishedAt: new Date()
    }
  });
}

main()
  .catch((error) => {
    console.error("Failed to seed placeholder crossword", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
