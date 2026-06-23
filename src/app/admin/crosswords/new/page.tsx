import { CrosswordAuthoringStudio } from "@/components/admin/crossword-authoring-studio";
import { requireAdminSession } from "@/lib/auth/admin-session";

export default async function NewCrosswordPage() {
  await requireAdminSession();

  return <CrosswordAuthoringStudio />;
}

