import type { ReactNode } from "react";

import { AppFooter } from "@/components/app-shell/app-footer";
import { AppHeader } from "@/components/app-shell/app-header";
import { cn } from "@/lib/utils/cn";

export function GameShell({
  children,
  chrome = "default"
}: {
  children: ReactNode;
  chrome?: "default" | "game";
}) {
  return (
    <div className="min-h-app bg-background bg-halo text-text">
      <AppHeader compact={chrome === "game"} />
      <main
        className={cn(
          "mx-auto max-w-6xl px-4 sm:px-6",
          chrome === "game" ? "min-h-[calc(100dvh-4.5rem)] py-4 sm:py-6" : "min-h-[calc(100dvh-9rem)] py-6 sm:py-8"
        )}
      >
        {children}
      </main>
      {chrome === "default" ? <AppFooter /> : null}
    </div>
  );
}
