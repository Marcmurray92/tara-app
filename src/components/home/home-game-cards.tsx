"use client";

import {
  CheckCircle2,
  Circle,
  CircleDot,
  Grid2X2,
  Palette,
  Puzzle,
  ScanSearch,
  Star,
  type LucideIcon
} from "lucide-react";

import { useBirthdayProgress } from "@/components/games/use-birthday-progress";
import { Reveal } from "@/components/ui/reveal";
import { TransitionLink } from "@/components/ui/transition-link";
import { loadColourFieldProgress } from "@/features/colour-field/game/colour-field-storage";
import {
  getCompletedColourFieldCount,
  readColourFieldStatusSummary
} from "@/features/colour-field/game/colour-field-engine";
import {
  listSeededColourFieldSummaries,
  placeholderColourFieldContentVersion,
  placeholderColourFieldGameData,
  placeholderColourFieldSlug
} from "@/features/colour-field/seed/placeholder-colour-field";
import { loadConnectionsProgress } from "@/features/connections/game/connections-storage";
import {
  listSeededConnectionsSummaries,
  type SeededConnectionsContent
} from "@/features/connections/seed/placeholder-connections";
import { readLocalCrosswordStatus } from "@/features/crossword/game/crossword-storage";
import { loadGuessingProgress } from "@/features/guessing/game/guessing-storage";
import {
  placeholderGuessingContentVersion,
  placeholderGuessingGameData,
  placeholderGuessingSlug
} from "@/features/guessing/seed/placeholder-guessing";
import type { GameType } from "@/features/games/game.types";
import { loadWhoLikedItBetterProgress } from "@/features/who-liked-it-better/game/who-liked-it-better-storage";
import {
  placeholderWhoLikedItBetterContentVersion,
  placeholderWhoLikedItBetterGameData,
  placeholderWhoLikedItBetterSlug
} from "@/features/who-liked-it-better/seed/placeholder-who-liked-it-better";
import { cn } from "@/lib/utils/cn";

type HomeCrosswordSummary = {
  slug: string;
  href: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  contentVersion: number;
  clueCount: number;
};

type HomeCardStatus = "none" | "in-progress" | "completed";

type HomeSectionCard = {
  id: string;
  href: string;
  title: string;
  description?: string | null;
  meta: string;
  badge: string;
  status: HomeCardStatus;
};

type HomeSection = {
  type: GameType;
  title: string;
  description: string;
  icon: LucideIcon;
  items: HomeSectionCard[];
};

function getStatusIcon(status: HomeCardStatus) {
  switch (status) {
    case "completed":
      return CheckCircle2;
    case "in-progress":
      return CircleDot;
    default:
      return Circle;
  }
}

function getCrosswordBadge(status: HomeCardStatus) {
  switch (status) {
    case "completed":
      return "Finished";
    case "in-progress":
      return "In progress";
    default:
      return "Not started";
  }
}

function getConnectionsBadge(connections: Pick<SeededConnectionsContent, "slug" | "contentVersion" | "groupCount">) {
  const progress = loadConnectionsProgress(connections.slug, connections.contentVersion);

  if (!progress) {
    return {
      badge: "Not started",
      status: "none" as const
    };
  }

  if (progress.status === "won") {
    return {
      badge: "Finished",
      status: "completed" as const
    };
  }

  return {
    badge: `${progress.solvedGroupIds.length}/${connections.groupCount} solved`,
    status: "in-progress" as const
  };
}

function getGuessingBadge() {
  const progress = loadGuessingProgress(placeholderGuessingSlug, placeholderGuessingContentVersion);

  if (!progress) {
    return {
      badge: "Not started",
      status: "none" as const
    };
  }

  const solvedCount = progress.roundRecords.filter((record) => record.result === "solved").length;

  if (progress.completedAt) {
    return {
      badge: `${placeholderGuessingGameData.rounds.length}/${placeholderGuessingGameData.rounds.length} cleared`,
      status: "completed" as const
    };
  }

  return {
    badge: `${solvedCount}/${placeholderGuessingGameData.rounds.length} cleared`,
    status: "in-progress" as const
  };
}

function getWhoLikedBadge() {
  const progress = loadWhoLikedItBetterProgress(
    placeholderWhoLikedItBetterSlug,
    placeholderWhoLikedItBetterContentVersion
  );

  if (!progress) {
    return {
      badge: "Not started",
      status: "none" as const
    };
  }

  if (progress.completedAt) {
    return {
      badge: `${placeholderWhoLikedItBetterGameData.questions.length}/${placeholderWhoLikedItBetterGameData.questions.length} answered`,
      status: "completed" as const
    };
  }

  return {
    badge: `${progress.answers.length}/${placeholderWhoLikedItBetterGameData.questions.length} answered`,
    status: "in-progress" as const
  };
}

function getColourFieldBadge() {
  const progress = loadColourFieldProgress(placeholderColourFieldSlug, placeholderColourFieldContentVersion);

  if (!progress) {
    return {
      badge: "Not started",
      status: "none" as const
    };
  }

  const status = readColourFieldStatusSummary(placeholderColourFieldGameData, progress);
  const completedCount = getCompletedColourFieldCount(placeholderColourFieldGameData, progress);
  const totalCount = placeholderColourFieldGameData.levels.length;

  if (status === "completed") {
    return {
      badge: "Finished",
      status: "completed" as const
    };
  }

  return {
    badge: `${completedCount}/${totalCount} restored`,
    status: "in-progress" as const
  };
}

function buildHomeSections(crosswords: HomeCrosswordSummary[]): HomeSection[] {
  const connectionsBoards = listSeededConnectionsSummaries();
  const colourFieldPacks = listSeededColourFieldSummaries();
  const colourFieldState = getColourFieldBadge();
  const guessingState = getGuessingBadge();
  const whoLikedState = getWhoLikedBadge();

  return [
    {
      type: "crossword",
      title: "Crossword",
      description: "Pick any grid and swipe across the full set.",
      icon: Puzzle,
      items: crosswords.map((crossword) => {
        const status = readLocalCrosswordStatus(crossword.slug, crossword.contentVersion);

        return {
          id: crossword.slug,
          href: crossword.href,
          title: crossword.title,
          description: crossword.description,
          meta: `${crossword.clueCount} clues`,
          badge: getCrosswordBadge(status),
          status
        };
      })
    },
    {
      type: "connections",
      title: "Connections",
      description: "Each board gets its own card and its own progress.",
      icon: Grid2X2,
      items: connectionsBoards.map((board) => {
        const progress = getConnectionsBadge(board);

        return {
          id: board.slug,
          href: board.href,
          title: board.title,
          description: board.description,
          meta: `${board.groupCount} groups`,
          badge: progress.badge,
          status: progress.status
        };
      })
    },
    {
      type: "colour-field",
      title: "Colour Field",
      description: "Restore the gradient without touching the anchors.",
      icon: Palette,
      items: colourFieldPacks.map((pack) => ({
        id: pack.slug,
        href: pack.href,
        title: pack.title,
        description: pack.description,
        meta: `${pack.levelCount} levels`,
        badge: colourFieldState.badge,
        status: colourFieldState.status
      }))
    },
    {
      type: "guessing",
      title: "Movie Review Guess",
      description: "Three rounds, one review screenshot at a time.",
      icon: ScanSearch,
      items: [
        {
          id: placeholderGuessingSlug,
          href: "/games/guessing",
          title: "Review Set 1",
          description: "Easy, Medium, Hard.",
          meta: `${placeholderGuessingGameData.rounds.length} rounds`,
          badge: guessingState.badge,
          status: guessingState.status
        }
      ]
    },
    {
      type: "who-liked-it-better",
      title: "Who Liked It Better",
      description: "Swipe into the Tara-versus-celeb rating run.",
      icon: Star,
      items: [
        {
          id: placeholderWhoLikedItBetterSlug,
          href: "/games/who-liked-it-better",
          title: "Ratings Set 1",
          description: "Tara versus the celebs.",
          meta: `${placeholderWhoLikedItBetterGameData.questions.length} questions`,
          badge: whoLikedState.badge,
          status: whoLikedState.status
        }
      ]
    }
  ];
}

export function HomeGameCards({ crosswords }: { crosswords: HomeCrosswordSummary[] }) {
  useBirthdayProgress();
  const sections = buildHomeSections(crosswords);

  return (
    <div className="w-full px-3 py-4 sm:px-6">
      <h1 data-page-title="true" tabIndex={-1} className="sr-only">
        Tara&apos;s birthday games
      </h1>

      <div className="space-y-7 sm:space-y-8">
        {sections.map((section, index) => {
          const Icon = section.icon;

          return (
            <Reveal key={section.type} delay={70 + index * 45}>
              <section className="space-y-3" aria-label={section.title}>
                <div className="px-1">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-accent/20 bg-accent-soft text-accent">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="font-display text-[2.2rem] leading-none text-text sm:text-[2.6rem]">
                      {section.title}
                    </h2>
                  </div>
                </div>

                <div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
                  <div className="flex snap-x snap-mandatory gap-3 pb-1">
                    {section.items.map((item) => {
                      const StatusIcon = getStatusIcon(item.status);

                      return (
                        <TransitionLink
                          key={item.id}
                          href={item.href}
                          direction="forward"
                          aria-label={`${section.title}: ${item.title}. ${item.badge}.`}
                          className={cn(
                            "flex min-h-[10.5rem] w-[15.75rem] shrink-0 snap-start flex-col rounded-[1.35rem] border p-4 transition hover:border-accent/45 hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:w-[17.5rem]",
                            item.status === "completed"
                              ? "animate-status-bloom border-accent/30 bg-accent-soft/70"
                              : item.status === "in-progress"
                                ? "border-accent/20 bg-surface/95"
                                : "border-white/10 bg-surface/90"
                          )}
                        >
                          <div className="flex items-start justify-end">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em]",
                                item.status === "completed"
                                  ? "border-accent/25 bg-black/20 text-text"
                                  : item.status === "in-progress"
                                    ? "border-accent/20 bg-accent-soft text-text"
                                    : "border-white/10 bg-black/20 text-muted"
                              )}
                            >
                              <StatusIcon className="h-3.5 w-3.5" />
                              {item.badge}
                            </span>
                          </div>

                          <div className="mt-auto space-y-2">
                            <h3 className="font-display text-[1.9rem] leading-tight text-text">{item.title}</h3>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted">{item.meta}</p>
                          </div>
                        </TransitionLink>
                      );
                    })}
                  </div>
                </div>
              </section>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
