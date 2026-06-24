import Link from "next/link";
import { notFound } from "next/navigation";

import { CrosswordGame } from "@/components/crossword/crossword-game";
import { CrosswordPreview } from "@/components/crossword/crossword-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getGameContentById } from "@/features/content/game-content.repository";
import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import { requireAdminSession } from "@/lib/auth/admin-session";

export default async function CrosswordPreviewPage({
  params
}: {
  params: { id: string };
}) {
  await requireAdminSession();

  const record = await getGameContentById(params.id);
  if (!record || record.gameType !== "crossword") {
    notFound();
  }

  const compiledData = record.compiledData as CrosswordCompiledData | undefined;

  return (
    <section className="space-y-6">
      <div className="rounded-[1.5rem] border border-white/10 bg-surface/90 p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Saved crossword preview</p>
        <h1 className="mt-2 font-display text-4xl">{record.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          This route shows the currently saved compiled crossword payload for this record, separate from the in-editor generated preview.
        </p>
        <div className="mt-4">
          <Button asChild={false} variant="outline">
            <Link href={`/admin/crosswords/${record.id}`}>Back to editor</Link>
          </Button>
        </div>
      </div>

      {compiledData ? (
        <div className="space-y-6">
          <CrosswordPreview puzzle={compiledData} />
          <CrosswordGame
            puzzle={compiledData}
            slug={`admin-preview-${record.id}`}
            contentVersion={record.contentVersion}
            title={record.title}
            subtitle={record.subtitle}
            eyebrow="Saved crossword preview"
          />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No saved compiled puzzle yet</CardTitle>
            <CardDescription>
              Generate a crossword in the editor and save it before this preview route can render the stored puzzle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild={false}>
              <Link href={`/admin/crosswords/${record.id}`}>Return to editor</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
