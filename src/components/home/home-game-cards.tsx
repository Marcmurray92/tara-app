"use client";

import {
  CheckCircle2,
  Circle,
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
  normaliseColourFieldProgress
} from "@/features/colour-field/game/colour-field-engine";
import {
  placeholderColourFieldContentVersion,
  placeholderColourFieldGameData,
  placeholderColourFieldSlug
} from "@/features/colour-field/seed/placeholder-colour-field";
import { loadConnectionsProgress } from "@/features/connections/game/connections-storage";
import {
  listSeededConnectionsSummaries,
  type SeededConnectionsContent
} from "@/features/connections/seed/placeholder-connections";
import { isEntryFilled } from "@/features/crossword/game/crossword-engine";
import { loadCrosswordProgress, readLocalCrosswordStatus } from "@/features/crossword/game/crossword-storage";
import type { CrosswordCompiledData } from "@/features/crossword/game/crossword-game.types";
import { loadGuessingProgress } from "@/features/guessing/game/guessing-storage";
import {
  listSeededGuessingSummaries,
  type SeededGuessingContent
} from "@/features/guessing/seed/placeholder-guessing";
import { getBirthdayDateLabel } from "@/features/games/birthday-date-labels";
import type { GameType } from "@/features/games/game.types";
import { loadWhoLikedItBetterProgress } from "@/features/who-liked-it-better/game/who-liked-it-better-storage";
import {
  listSeededWhoLikedItBetterSummaries,
  type SeededWhoLikedItBetterContent
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
  compiledData: CrosswordCompiledData;
};

type HomeCardStatus = "none" | "in-progress" | "completed";

type HomeSectionCardStatus =
  | {
      kind: "crossword";
      current: number;
      label: string;
      total: number;
    }
  | {
      kind: "connections";
      solved: number;
      total: number;
    }
  | {
      kind: "who-liked-it-better";
      answered: number;
      rounds: Array<"correct" | "wrong" | "pending">;
      score: number;
      total: number;
    }
  | {
      kind: "guessing";
      done: boolean;
    }
  | {
      kind: "colour-field-level";
      bestMoves: number | null;
      label: string;
      sizeLabel: string;
    };

type HomeSectionCard = {
  id: string;
  href: string;
  title: string;
  status: HomeCardStatus;
  widget: HomeSectionCardStatus;
};

type HomeSection = {
  type: GameType;
  title: string;
  description: string;
  icon: LucideIcon;
  titleClassName: string;
  iconClassName: string;
  items: HomeSectionCard[];
};

function getSectionPresentation(type: GameType) {
  switch (type) {
    case "crossword":
      return {
        title: "Crossword",
        description: "You know what this is.",
        icon: Puzzle,
        titleClassName: "text-arcade-green",
        iconClassName: "bg-arcade-green text-black border-black"
      };
    case "connections":
      return {
        title: "Connections",
        description: "This also.",
        icon: Grid2X2,
        titleClassName: "text-arcade-blue",
        iconClassName: "bg-arcade-blue text-black border-black"
      };
    case "who-liked-it-better":
      return {
        title: "Tara VS The World",
        description: "Who liked it more? You or Kanye?",
        icon: Star,
        titleClassName: "text-arcade-pink",
        iconClassName: "bg-arcade-pink text-white border-black"
      };
    case "guessing":
      return {
        title: "Review Roulette",
        description: "Guess the movie from the Letterboxd review.",
        icon: ScanSearch,
        titleClassName: "text-arcade-pink",
        iconClassName: "bg-arcade-pink text-white border-black"
      };
    case "colour-field":
      return {
        title: "50 Shades of Tara",
        description: "It’s I Love Hue but worse.. I love you? :)",
        icon: Palette,
        titleClassName: "text-arcade-yellow",
        iconClassName: "bg-arcade-yellow text-black border-black"
      };
  }
}

function renderStatusPips(rounds: Array<"correct" | "wrong" | "pending">) {
  return (
    <div className="flex items-center gap-2">
      {rounds.map((round, index) => (
        <span
          key={`${round}-${index}`}
          className={cn(
            "h-3.5 w-3.5 rounded-full border-2",
            round === "correct"
              ? "border-arcade-green bg-arcade-green"
              : round === "wrong"
                ? "border-arcade-pink bg-arcade-pink"
                : "border-white bg-transparent"
          )}
        />
      ))}
    </div>
  );
}

function getCrosswordWidget(crossword: HomeCrosswordSummary) {
  const progress = loadCrosswordProgress(crossword.slug, crossword.contentVersion);
  const status = readLocalCrosswordStatus(crossword.slug, crossword.contentVersion);
  const current = progress
    ? crossword.compiledData.entries.filter((entry) => isEntryFilled(crossword.compiledData, progress, entry)).length
    : 0;

  return {
    status,
    widget: {
      kind: "crossword" as const,
      current,
      total: crossword.clueCount,
      label: status === "completed" ? "Done" : status === "in-progress" ? "Started" : "Not Started"
    }
  };
}

function getConnectionsWidget(board: Pick<SeededConnectionsContent, "slug" | "contentVersion" | "groupCount">) {
  const progress = loadConnectionsProgress(board.slug, board.contentVersion);

  if (!progress) {
    return {
      status: "none" as const,
      widget: {
        kind: "connections" as const,
        solved: 0,
        total: board.groupCount
      }
    };
  }

  return {
    status: progress.status === "won" ? ("completed" as const) : ("in-progress" as const),
    widget: {
      kind: "connections" as const,
      solved: progress.solvedGroupIds.length,
      total: board.groupCount
    }
  };
}

function getWhoLikedWidget(
  game: Pick<SeededWhoLikedItBetterContent, "slug" | "contentVersion" | "gameData">
) {
  const progress = loadWhoLikedItBetterProgress(game.slug, game.contentVersion);

  if (!progress) {
    return {
      status: "none" as const,
      widget: {
        kind: "who-liked-it-better" as const,
        answered: 0,
        rounds: game.gameData.questions.map(() => "pending" as const),
        score: 0,
        total: game.gameData.questions.length
      }
    };
  }

  const rounds = game.gameData.questions.map((question) => {
    const answer = progress.answers.find((entry) => entry.questionId === question.id);

    if (!answer) {
      return "pending" as const;
    }

    return answer.correct ? ("correct" as const) : ("wrong" as const);
  });

  return {
    status: progress.completedAt ? ("completed" as const) : ("in-progress" as const),
    widget: {
      kind: "who-liked-it-better" as const,
      answered: progress.answers.length,
      rounds,
      score: progress.score,
      total: game.gameData.questions.length
    }
  };
}

function getGuessingWidget(game: Pick<SeededGuessingContent, "slug" | "contentVersion">) {
  const progress = loadGuessingProgress(game.slug, game.contentVersion);

  return {
    status: !progress ? ("none" as const) : progress.completedAt ? ("completed" as const) : ("in-progress" as const),
    widget: {
      kind: "guessing" as const,
      done: Boolean(progress?.completedAt)
    }
  };
}

function getColourFieldProgress() {
  const progress = loadColourFieldProgress(placeholderColourFieldSlug, placeholderColourFieldContentVersion);
  return normaliseColourFieldProgress(placeholderColourFieldGameData, progress);
}

function buildHomeSections(crosswords: HomeCrosswordSummary[]): HomeSection[] {
  const connectionsBoards = listSeededConnectionsSummaries();
  const whoLikedGames = listSeededWhoLikedItBetterSummaries();
  const guessingGames = listSeededGuessingSummaries();
  const colourFieldProgress = getColourFieldProgress();

  const sectionOrder: GameType[] = [
    "crossword",
    "connections",
    "who-liked-it-better",
    "guessing",
    "colour-field"
  ];

  return sectionOrder.map<HomeSection>((type) => {
    const presentation = getSectionPresentation(type);

    if (type === "crossword") {
      return {
        type,
        ...presentation,
        items: crosswords.map((crossword, index) => {
          const crosswordState = getCrosswordWidget(crossword);

          return {
            id: crossword.slug,
            href: crossword.href,
            title: getBirthdayDateLabel(index),
            status: crosswordState.status as HomeCardStatus,
            widget: crosswordState.widget
          };
        })
      };
    }

    if (type === "connections") {
      return {
        type,
        ...presentation,
        items: connectionsBoards.map((board, index) => {
          const boardState = getConnectionsWidget(board);

          return {
            id: board.slug,
            href: board.href,
            title: getBirthdayDateLabel(index),
            status: boardState.status as HomeCardStatus,
            widget: boardState.widget
          };
        })
      };
    }

    if (type === "who-liked-it-better") {
      return {
        type,
        ...presentation,
        items: whoLikedGames.map((game, index) => {
          const whoLikedState = getWhoLikedWidget(game);

          return {
            id: game.slug,
            href: game.href,
            title: getBirthdayDateLabel(index),
            status: whoLikedState.status as HomeCardStatus,
            widget: whoLikedState.widget
          };
        })
      };
    }

    if (type === "guessing") {
      return {
        type,
        ...presentation,
        items: guessingGames.map((game, index) => {
          const guessingState = getGuessingWidget(game);

          return {
            id: game.slug,
            href: game.href,
            title: getBirthdayDateLabel(index),
            status: guessingState.status as HomeCardStatus,
            widget: guessingState.widget
          };
        })
      };
    }

    return {
      type,
      ...presentation,
      items: placeholderColourFieldGameData.levels.map((level, index) => {
        const levelProgress = colourFieldProgress.levels[level.slug];
        const status = levelProgress.completedAt
          ? ("completed" as const)
          : levelProgress.currentMoves > 0 || Boolean(levelProgress.startedAt)
            ? ("in-progress" as const)
            : ("none" as const);

        return {
          id: level.slug,
          href: `/games/colour-field/${level.slug}`,
          title: getBirthdayDateLabel(index),
          status,
          widget: {
            kind: "colour-field-level" as const,
            label: levelProgress.completedAt
              ? "Done"
              : status === "in-progress"
                ? "Started"
                : levelProgress.unlocked
                  ? "Not Done"
                  : "Locked",
            sizeLabel: `${level.columns} x ${level.rows}`,
            bestMoves: levelProgress.bestMoves
          }
        };
      })
    };
  });
}

function HomeStatusWidget({
  status,
  widget
}: {
  status: HomeCardStatus;
  widget: HomeSectionCardStatus;
}) {
  if (widget.kind === "crossword") {
    const width = widget.total > 0 ? (widget.current / widget.total) * 100 : 0;

    return (
      <div className="space-y-3">
        <p className="font-body text-sm text-muted">{widget.label}</p>
        <div className="flex items-center gap-3">
          <div className="arcade-progress-track h-4 flex-1">
            <div className="arcade-progress-fill" style={{ width: `${width}%` }} />
          </div>
          <span className="font-body text-lg text-white">
            {widget.current}/{widget.total}
          </span>
        </div>
      </div>
    );
  }

  if (widget.kind === "connections") {
    if (status === "none") {
      return (
        <div className="flex items-center justify-between gap-3">
          <p className="font-body text-sm text-muted">Not Started</p>
          <span className="font-body text-lg text-white">0/{widget.total}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Array.from({ length: widget.total }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-3.5 w-3.5 rounded-full border-2 border-arcade-blue",
                index < widget.solved ? "bg-arcade-blue" : "bg-transparent opacity-35"
              )}
            />
          ))}
        </div>
        <span className="font-body text-lg text-white">
          {widget.solved}/{widget.total}
        </span>
      </div>
    );
  }

  if (widget.kind === "who-liked-it-better") {
    const summary =
      status === "none"
        ? "Not Started"
        : status === "completed"
          ? `${widget.score}/${widget.total}, Main character.`
          : `${widget.score}/${widget.answered}, On it!`;

    return (
      <div className="space-y-3">
        {renderStatusPips(widget.rounds)}
        <p className="font-body text-sm text-white">{summary}</p>
      </div>
    );
  }

  if (widget.kind === "guessing") {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="font-body text-lg text-white">{widget.done ? "Done!" : "Not Done"}</p>
        {widget.done ? <CheckCircle2 className="h-5 w-5 text-arcade-green" /> : <Circle className="h-5 w-5 text-white" />}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-between gap-3">
      <div className="space-y-1">
        <p className="font-body text-lg text-white">{widget.label}</p>
        <p className="font-body text-sm text-muted">{widget.sizeLabel}</p>
      </div>
      {widget.bestMoves !== null ? <span className="font-body text-sm text-white">Best {widget.bestMoves}</span> : null}
    </div>
  );
}

export function HomeGameCards({ crosswords }: { crosswords: HomeCrosswordSummary[] }) {
  const snapshot = useBirthdayProgress();
  const sections = buildHomeSections(crosswords);

  return (
    <div className="w-full px-3 py-3 sm:px-6">
      <h1 data-page-title="true" tabIndex={-1} className="sr-only">
        Tara&apos;s birthday games
      </h1>

      <div className="mx-auto max-w-5xl space-y-5">
        <Reveal delay={20}>
          <div className="safe-top sticky top-0 z-20 rounded-[1rem] border-2 border-white bg-[#0327ff] px-4 py-3 shadow-[0_8px_0_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-3">
              <p className="font-display text-[2rem] uppercase leading-none text-white sm:text-[2.4rem]">
                Hi Tara :)
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={70}>
          <section
            className="rounded-[1rem] border-2 border-white px-5 py-8 text-center shadow-[0_10px_0_rgba(0,0,0,0.25)]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.48), rgba(0,0,0,0.48)), linear-gradient(135deg, rgba(255,0,85,0.92) 0%, rgba(255,0,85,0.82) 34%, rgba(5,5,5,0.82) 58%, rgba(2,241,255,0.74) 100%), url('/wedding.jpg')",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat"
            }}
          >
            <div className="text-4xl" aria-hidden="true">
              🎂
            </div>
            <h2 className="mt-4 font-display text-[3rem] uppercase leading-none text-white sm:text-[3.6rem]">
              Happy Birthday
            </h2>
            <p className="mt-4 font-body text-lg text-white/90">
              I made you some silly games, scroll down!
            </p>
          </section>
        </Reveal>

        <div className="space-y-7">
          {sections.map((section, index) => {
            const Icon = section.icon;

            return (
              <Reveal key={section.type} delay={140 + index * 35}>
                <section className="space-y-3" aria-label={section.title}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex h-11 w-11 items-center justify-center rounded-[0.7rem] border-2",
                          section.iconClassName
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <h2 className={cn("font-display text-[2.2rem] uppercase leading-none sm:text-[2.6rem]", section.titleClassName)}>
                        {section.title}
                      </h2>
                    </div>
                    <p className="font-body text-sm text-white/82">{section.description}</p>
                  </div>

                  <div className="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
                    <div className="flex snap-x snap-mandatory gap-3 pb-1">
                      {section.items.map((item) => (
                        <TransitionLink
                          key={item.id}
                          href={item.href}
                          direction="forward"
                          aria-label={`${section.title}: ${item.title}`}
                          className={cn(
                            "arcade-panel flex min-h-[11.25rem] w-[calc(50vw-1.05rem)] min-w-[10.75rem] shrink-0 snap-start flex-col justify-between rounded-[0.95rem] p-4 transition hover:-translate-y-0.5 hover:border-arcade-blue hover:shadow-[8px_8px_0_rgba(2,241,255,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:w-[16rem]",
                            item.status === "completed" ? "border-arcade-green" : ""
                          )}
                        >
                          <div className="space-y-3">
                            <h3 className="font-display text-[1.35rem] uppercase leading-tight text-white sm:text-[1.55rem]">
                              {item.title}
                            </h3>
                          </div>

                          <HomeStatusWidget status={item.status} widget={item.widget} />
                        </TransitionLink>
                      ))}
                    </div>
                  </div>
                </section>
              </Reveal>
            );
          })}
        </div>

        <p className="sr-only" aria-live="polite">
          {snapshot.completedCount} of {snapshot.items.length} games cleared.
        </p>
      </div>
    </div>
  );
}
