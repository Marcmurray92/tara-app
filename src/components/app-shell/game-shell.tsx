import type { ReactNode } from "react";

import { AppFooter } from "@/components/app-shell/app-footer";
import { AppHeader } from "@/components/app-shell/app-header";

export function GameShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-halo text-text">
      <AppHeader />
      <main className="mx-auto min-h-[calc(100vh-9rem)] max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      <AppFooter />
    </div>
  );
}

