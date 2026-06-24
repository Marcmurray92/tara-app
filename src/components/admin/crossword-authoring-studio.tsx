"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CrosswordGame } from "@/components/crossword/crossword-game";
import { CrosswordGeneratorControls } from "@/components/crossword/crossword-generator-controls";
import { CrosswordPreview } from "@/components/crossword/crossword-preview";
import { ImportIssues } from "@/components/import/import-issues";
import { ImportPreview } from "@/components/import/import-preview";
import { PasteDataDialog } from "@/components/import/paste-data-dialog";
import { TabularImport } from "@/components/import/tabular-import";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CrosswordAuthoringInitialData } from "@/features/crossword/admin/crossword-authoring-state";
import { compileCrossword } from "@/features/crossword/generator/crossword-generator";
import type { CrosswordCompilationResult } from "@/features/crossword/generator/crossword-generator.types";
import { createCrosswordSourceDataEnvelope } from "@/features/crossword/source/crossword-source-data";
import { parseCrosswordSource } from "@/features/crossword/source/crossword-source.parser";
import type { CrosswordCompleteSourceRow, CrosswordSourceRow } from "@/features/crossword/source/crossword-source.types";
import type { ImportResult } from "@/features/content/import.types";
import { slugify } from "@/lib/utils/strings";

function countByStatus(rows: CrosswordSourceRow[]) {
  return rows.reduce(
    (totals, row) => {
      totals[row.status] += 1;
      return totals;
    },
    { complete: 0, incomplete: 0, invalid: 0 }
  );
}

const DEFAULT_INITIAL_DATA: CrosswordAuthoringInitialData = {
  title: "Tara's Birthday Crossword",
  slug: "taras-birthday-crossword",
  subtitle: "Phase 1 crossword",
  description: "Birthday crossword content created from imported sheet rows.",
  completionTitle: "You did it",
  completionMessage: "Placeholder completion copy. Replace this when the final clue set is ready.",
  seed: "tara-admin-seed",
  importResult: null,
  selectedRowIds: [],
  compilation: null
};

export function CrosswordAuthoringStudio({
  initialData = DEFAULT_INITIAL_DATA
}: {
  initialData?: CrosswordAuthoringInitialData;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title);
  const [slug, setSlug] = useState(initialData.slug);
  const [subtitle, setSubtitle] = useState(initialData.subtitle);
  const [description, setDescription] = useState(initialData.description);
  const [completionTitle, setCompletionTitle] = useState(initialData.completionTitle);
  const [completionMessage, setCompletionMessage] = useState(initialData.completionMessage);
  const [rawText, setRawText] = useState("");
  const [seed, setSeed] = useState(initialData.seed);
  const [importResult, setImportResult] = useState<ImportResult<CrosswordSourceRow> | null>(initialData.importResult);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set(initialData.selectedRowIds));
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [compilation, setCompilation] = useState<CrosswordCompilationResult | null>(initialData.compilation);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const isEditing = Boolean(initialData.contentId);

  const counts = useMemo(() => (importResult ? countByStatus(importResult.rows) : null), [importResult]);

  const availableCategories = useMemo(() => {
    if (!importResult) {
      return [];
    }

    return Array.from(new Set(importResult.rows.map((row) => row.category).filter(Boolean))).sort();
  }, [importResult]);

  const filteredRows = useMemo(() => {
    if (!importResult) {
      return [];
    }

    return importResult.rows.filter((row) => {
      const categoryMatch = categoryFilter === "all" ? true : row.category === categoryFilter;
      const searchValue = `${row.clue} ${row.answer}`.toLowerCase();
      const searchMatch = search.trim() ? searchValue.includes(search.trim().toLowerCase()) : true;
      return categoryMatch && searchMatch;
    });
  }, [categoryFilter, importResult, search]);

  function parsePreview() {
    const result = parseCrosswordSource(rawText);
    setImportResult(result);
    setSaveMessage(null);
    const nextSelected = new Set(result.rows.filter((row) => row.status === "complete").map((row) => row.id));
    setSelectedRowIds(nextSelected);
    setCompilation(null);
  }

  function toggleRow(rowId: string) {
    setSelectedRowIds((current) => {
      const next = new Set(current);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }

  function generateCrossword() {
    if (!importResult) {
      return;
    }

    const selectedRows = importResult.rows.filter(
      (row): row is CrosswordCompleteSourceRow => row.status === "complete" && selectedRowIds.has(row.id)
    );

    const result = compileCrossword({
      rows: selectedRows,
      seed,
      completion: {
        title: completionTitle,
        message: completionMessage,
        actionLabel: "Back home",
        actionHref: "/"
      }
    });

    setCompilation(result);
  }

  function save(status: "draft" | "published") {
    if (!importResult) {
      return;
    }

    if (status === "published" && !compilation?.compiledData) {
      setSaveMessage("Generate a valid crossword before publishing.");
      return;
    }

    startSaving(async () => {
      setSaveMessage(null);

      const response = await fetch("/api/admin/crosswords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contentId: initialData.contentId,
          title,
          slug,
          subtitle,
          description,
          status,
          sourceData: createCrosswordSourceDataEnvelope({
            rows: importResult.rows,
            authoring: {
              selectedRowIds: Array.from(selectedRowIds),
              seed,
              completion: {
                title: completionTitle,
                message: completionMessage,
                actionLabel: "Back home",
                actionHref: "/"
              },
              importMetadata: {
                detectedHeaders: importResult.detectedHeaders,
                unknownHeaders: importResult.unknownHeaders,
                ignoredBlankRows: importResult.ignoredBlankRows
              }
            }
          }),
          compiledData: compilation?.compiledData
        })
      });

      const payload = (await response.json()) as { ok: boolean; message?: string; record?: { id: string } };

      if (!response.ok || !payload.ok) {
        setSaveMessage(payload.message ?? "Unable to save crossword content.");
        return;
      }

      setSaveMessage(status === "published" ? "Crossword published." : "Draft saved.");
      if (!isEditing && payload.record?.id) {
        router.push(`/admin/crosswords/${payload.record.id}`);
        router.refresh();
        return;
      }

      router.refresh();
    });
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[1.5rem] border border-white/10 bg-surface/90 p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Crossword authoring</p>
        <h1 className="mt-2 font-display text-4xl">{isEditing ? "Edit crossword" : "New crossword"}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Import draft-friendly sheet data, preview every row honestly, choose the final set of complete answers, and generate a publishable crossword without hiding any unplaced entries.
        </p>
        {isEditing ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge>{initialData.status}</Badge>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/crosswords/${initialData.contentId}/preview`}>Saved preview</Link>
            </Button>
            <form
              action={`/api/admin/crosswords/${initialData.contentId}/duplicate`}
              method="post"
              onSubmit={(event) => {
                if (!window.confirm("Duplicate this crossword as a new draft?")) {
                  event.preventDefault();
                }
              }}
            >
              <Button type="submit" variant="ghost" size="sm">
                Duplicate draft
              </Button>
            </form>
            {initialData.status !== "archived" ? (
              <form
                action={`/api/admin/crosswords/${initialData.contentId}/archive`}
                method="post"
                onSubmit={(event) => {
                  if (!window.confirm("Archive this crossword record?")) {
                    event.preventDefault();
                  }
                }}
              >
                <Button type="submit" variant="ghost" size="sm">
                  Archive
                </Button>
              </form>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>These values become the draft or published content record.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  setTitle(nextTitle);
                  setSlug((current) => (current === slugify(title) ? slugify(nextTitle) : current));
                }}
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" value={subtitle} onChange={(event) => setSubtitle(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="completion-title">Completion title</Label>
              <Input id="completion-title" value={completionTitle} onChange={(event) => setCompletionTitle(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="completion-message">Completion message</Label>
              <Textarea
                id="completion-message"
                value={completionMessage}
                onChange={(event) => setCompletionMessage(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <TabularImport onFileText={setRawText} onParse={parsePreview} />
          <PasteDataDialog value={rawText} onChange={setRawText} />
        </div>
      </div>

      {importResult ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Complete rows</CardDescription>
                  <CardTitle>{counts?.complete ?? 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Incomplete rows</CardDescription>
                  <CardTitle>{counts?.incomplete ?? 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Invalid rows</CardDescription>
                  <CardTitle>{counts?.invalid ?? 0}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Ignored blank rows</CardDescription>
                  <CardTitle>{importResult.ignoredBlankRows}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Unknown headers</CardDescription>
                  <CardTitle>{importResult.unknownHeaders.length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="search">Search clue or answer</Label>
                <Input id="search" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <div>
                <Label htmlFor="category">Category filter</Label>
                <select
                  id="category"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="flex h-11 w-full rounded-lg border border-border bg-surface-strong px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <option value="all">All categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ImportPreview rows={filteredRows} selectedRowIds={selectedRowIds} onToggleRow={toggleRow} />

            <CrosswordGeneratorControls seed={seed} onSeedChange={setSeed} onGenerate={generateCrossword} />

            {compilation ? (
              <div className="space-y-4">
                {compilation.compiledData ? <CrosswordPreview puzzle={compilation.compiledData} /> : null}
                {compilation.unplacedRows.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Unplaced entries</CardTitle>
                      <CardDescription>
                        Nothing is silently dropped. These entries were selected but could not fit this generated layout.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {compilation.unplacedRows.map((row) => (
                        <div key={row.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
                          <p className="font-medium text-text">{row.answer}</p>
                          <p className="text-muted">{row.reason}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <ImportIssues issues={importResult.issues} />
            <Card>
              <CardHeader>
                <CardTitle>Save or publish</CardTitle>
                <CardDescription>
                  Draft saves keep the full source row bank. Publishing requires a valid compiled crossword.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>{selectedRowIds.size} selected complete rows</Badge>
                  <Badge>{importResult.detectedHeaders.length} detected headers</Badge>
                  {compilation?.compiledData ? <Badge>Grid ready</Badge> : null}
                </div>
                <div className="flex flex-col gap-3">
                  <Button variant="outline" onClick={() => save("draft")} disabled={isSaving}>
                    Save draft
                  </Button>
                  <Button onClick={() => save("published")} disabled={isSaving || !compilation?.compiledData}>
                    Publish crossword
                  </Button>
                </div>
                {saveMessage ? <p className="text-sm text-muted">{saveMessage}</p> : null}
                {isEditing ? (
                  <p className="text-xs leading-6 text-muted">
                    Editing an existing record keeps its identity, increments content version only when source or compiled gameplay data changes, and lets you reopen the saved preview route at any time.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {compilation?.compiledData ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Playable preview</p>
            <h2 className="font-display text-3xl">Preview the generated crossword</h2>
          </div>
          <CrosswordGame
            puzzle={compilation.compiledData}
            slug={`${slug}-preview`}
            contentVersion={0}
            title={title}
            subtitle={subtitle}
            eyebrow="Generated crossword preview"
          />
        </div>
      ) : null}
    </section>
  );
}
