import { GameShell } from "@/components/app-shell/game-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <GameShell>{children}</GameShell>;
}

