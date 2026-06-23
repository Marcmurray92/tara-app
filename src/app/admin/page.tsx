import Link from "next/link";
import { Eye, Pencil, Plus } from "lucide-react";

import { requireAdminSession } from "@/lib/auth/admin-session";
import { listGameContent } from "@/features/content/game-content.repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/strings";

export default async function AdminDashboardPage() {
  await requireAdminSession();

  let records = [] as Awaited<ReturnType<typeof listGameContent>>;
  let databaseMessage: string | null = null;

  try {
    records = await listGameContent();
  } catch {
    databaseMessage = "Database records are unavailable right now. The protected admin surface is live, but DATABASE_URL still needs to be configured for listing and saves.";
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-surface/90 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Admin dashboard</p>
          <h1 className="font-display text-4xl">Game content</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
            Crossword authoring is live in this phase. Connections and Guessing are represented structurally, without pretending their gameplay is already built.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild={false}>
            <Link href="/admin/crosswords/new">
              <Plus className="h-4 w-4" />
              New crossword
            </Link>
          </Button>
          <form action="/api/admin/logout" method="post">
            <Button type="submit" variant="outline">Log out</Button>
          </form>
        </div>
      </div>

      {databaseMessage ? (
        <div className="rounded-[1.2rem] border border-accent/25 bg-accent-soft p-4 text-sm leading-7 text-text">
          {databaseMessage}
        </div>
      ) : null}

      <div className="grid gap-4">
        {records.map((record) => (
          <Card key={record.id}>
            <CardHeader className="sm:flex sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <Badge>{record.status}</Badge>
                <CardTitle>{record.title}</CardTitle>
                <CardDescription>
                  {record.gameType} / {record.slug}
                </CardDescription>
              </div>
              <div className="text-sm text-muted">Updated {formatDate(record.updatedAt)}</div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span>Content version {record.contentVersion}</span>
                <span>Source schema v{record.sourceSchemaVersion}</span>
              </div>
              {record.gameType === "crossword" ? (
                <div className="flex gap-2">
                  <Button asChild={false} variant="outline" size="sm">
                    <Link href={`/admin/crosswords/${record.id}`}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button asChild={false} variant="ghost" size="sm">
                    <Link href={`/admin/crosswords/${record.id}/preview`}>
                      <Eye className="h-4 w-4" />
                      Preview
                    </Link>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}

        {records.length === 0 && !databaseMessage ? (
          <Card>
            <CardHeader>
              <CardTitle>No records yet</CardTitle>
              <CardDescription>Run the seed or save a draft crossword from the admin authoring flow.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </section>
  );
}
