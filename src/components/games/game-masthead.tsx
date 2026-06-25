import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type GameMastheadItem = {
  label: string;
  value: string;
};

export function GameMasthead({
  eyebrow,
  title,
  subtitle,
  items = [],
  actions,
  className
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  items?: GameMastheadItem[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[1.2rem] border border-white/10 bg-surface/90 p-3.5 sm:p-4", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          {eyebrow ? <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">{eyebrow}</p> : null}
          <div className="space-y-1">
            <h1 data-page-title="true" tabIndex={-1} className="font-display text-[1.9rem] leading-tight sm:text-[2.35rem]">
              {title}
            </h1>
            {subtitle ? <p className="max-w-3xl text-sm leading-5 text-muted">{subtitle}</p> : null}
          </div>
        </div>

        {(items.length > 0 || actions) ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="rounded-full border border-white/10 bg-black/20 px-3.5 py-2 text-sm text-muted"
              >
                <span className="text-text">{item.value}</span>
                <span className="ml-1.5">{item.label}</span>
              </div>
            ))}
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
