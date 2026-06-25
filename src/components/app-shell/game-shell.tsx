import type { ReactNode } from "react";

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
      <AppHeader compact={chrome === "game"} hideOnMobile={chrome === "game"} />
      <main
        data-page-shell="true"
        className={cn(
          "mx-auto w-full",
          chrome === "game"
            ? "max-w-none min-h-[100svh] px-0 py-0 sm:min-h-[100dvh] sm:px-3 sm:py-3 lg:max-w-6xl lg:min-h-[calc(100dvh-4.5rem)] lg:px-6 lg:py-6"
            : "max-w-6xl min-h-[calc(100dvh-9rem)] px-4 py-6 sm:px-6 sm:py-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}
