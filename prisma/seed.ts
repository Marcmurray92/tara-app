import { PrismaClient } from "@prisma/client";

import { seededCrosswords } from "../src/features/crossword/seed/placeholder-crossword";

const prisma = new PrismaClient();

async function main() {
  for (const crossword of seededCrosswords) {
    await prisma.gameContent.upsert({
      where: {
        gameType_slug: {
          gameType: "CROSSWORD",
          slug: crossword.slug
        }
      },
      create: {
        gameType: "CROSSWORD",
        slug: crossword.slug,
        title: crossword.title,
        subtitle: crossword.subtitle,
        description: crossword.description,
        status: "PUBLISHED",
        sourceSchemaVersion: 1,
        compiledSchemaVersion: 1,
        contentVersion: crossword.contentVersion,
        sourceData: crossword.sourceData,
        compiledData: crossword.compiledData,
        publishedAt: new Date()
      },
      update: {
        title: crossword.title,
        subtitle: crossword.subtitle,
        description: crossword.description,
        status: "PUBLISHED",
        sourceSchemaVersion: 1,
        compiledSchemaVersion: 1,
        contentVersion: crossword.contentVersion,
        sourceData: crossword.sourceData,
        compiledData: crossword.compiledData,
        publishedAt: new Date()
      }
    });
  }
}

main()
  .catch((error) => {
    console.error("Failed to seed Tara crossword content", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
