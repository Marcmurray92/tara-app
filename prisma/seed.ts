import { PrismaClient } from "@prisma/client";

import {
  placeholderCrosswordContentVersion,
  placeholderCrosswordCompiledData,
  placeholderCrosswordDescription,
  placeholderCrosswordSlug,
  placeholderCrosswordSourceData,
  placeholderCrosswordSubtitle,
  placeholderCrosswordTitle
} from "../src/features/crossword/seed/placeholder-crossword";

const prisma = new PrismaClient();

async function main() {
  await prisma.gameContent.upsert({
    where: {
      gameType_slug: {
        gameType: "CROSSWORD",
        slug: placeholderCrosswordSlug
      }
    },
    create: {
      gameType: "CROSSWORD",
      slug: placeholderCrosswordSlug,
      title: placeholderCrosswordTitle,
      subtitle: placeholderCrosswordSubtitle,
      description: placeholderCrosswordDescription,
      status: "PUBLISHED",
      sourceSchemaVersion: 1,
      compiledSchemaVersion: 1,
      contentVersion: placeholderCrosswordContentVersion,
      sourceData: placeholderCrosswordSourceData,
      compiledData: placeholderCrosswordCompiledData,
      publishedAt: new Date()
    },
    update: {
      title: placeholderCrosswordTitle,
      subtitle: placeholderCrosswordSubtitle,
      description: placeholderCrosswordDescription,
      status: "PUBLISHED",
      sourceSchemaVersion: 1,
      compiledSchemaVersion: 1,
      contentVersion: placeholderCrosswordContentVersion,
      sourceData: placeholderCrosswordSourceData,
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
