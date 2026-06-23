import { notFound } from "next/navigation";

import { CrosswordAuthoringStudio } from "@/components/admin/crossword-authoring-studio";
import { getGameContentById } from "@/features/content/game-content.repository";
import { buildCrosswordAuthoringInitialData } from "@/features/crossword/admin/crossword-authoring-state";
import { requireAdminSession } from "@/lib/auth/admin-session";

export default async function EditCrosswordPage({
  params
}: {
  params: { id: string };
}) {
  await requireAdminSession();

  const record = await getGameContentById(params.id);
  if (!record || record.gameType !== "crossword") {
    notFound();
  }

  return <CrosswordAuthoringStudio initialData={buildCrosswordAuthoringInitialData(record)} />;
}

