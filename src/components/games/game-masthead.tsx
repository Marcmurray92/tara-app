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
    <div className={cn("rounded-[1rem] border-2 border-white bg-surface/95 p-3.5 shadow-glow sm:p-4", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1.5">
          {eyebrow ? <p className="font-body text-[0.72rem] uppercase tracking-[0.24em] text-arcade-blue">{eyebrow}</p> : null}
          <div className="space-y-1">
            <h1 data-page-title="true" tabIndex={-1} className="font-display text-[1.9rem] uppercase leading-tight sm:text-[2.35rem]">
              {title}
            </h1>
            {subtitle ? <p className="max-w-3xl font-body text-sm leading-5 text-muted">{subtitle}</p> : null}
          </div>
        </div>

        {(items.length > 0 || actions) ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {items.map((item) => (
              <div
                key={item.label}
                className="rounded-md border-2 border-white bg-black px-3.5 py-2 font-body text-sm uppercase tracking-[0.12em] text-muted"
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
