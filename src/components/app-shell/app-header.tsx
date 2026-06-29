"use client";

import { Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { TransitionLink } from "@/components/ui/transition-link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  {
    href: "/",
    label: "Home",
    match: (pathname: string) => pathname === "/"
  },
  {
    href: "/games/connections",
    label: "Connections",
    match: (pathname: string) => pathname.startsWith("/games/connections")
  },
  {
    href: "/games/colour-field",
    label: "Colour Field",
    match: (pathname: string) => pathname.startsWith("/games/colour-field")
  },
  {
    href: "/games/guessing",
    label: "Review Guess",
    match: (pathname: string) => pathname.startsWith("/games/guessing")
  },
  {
    href: "/games/who-liked-it-better",
    label: "Liked It Better",
    match: (pathname: string) => pathname.startsWith("/games/who-liked-it-better")
  },
  {
    href: "/admin",
    label: "Admin",
    match: (pathname: string) => pathname.startsWith("/admin")
  }
] as const;

export function AppHeader({
  compact = false,
  hideOnMobile = false
}: {
  compact?: boolean;
  hideOnMobile?: boolean;
}) {
  const pathname = usePathname();
  const showMobileHome = pathname !== "/" && !pathname.startsWith("/admin/login");

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b-2 border-white bg-[#0327ff]/95 backdrop-blur",
        hideOnMobile ? "hidden lg:block" : ""
      )}
    >
      <div className="safe-top">
        <div className={cn("mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6", compact ? "py-3" : "py-4")}>
          <TransitionLink href="/" direction={pathname === "/" ? "fade" : "back"} className="inline-flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-md border-2 border-white bg-black text-arcade-green",
                compact ? "h-9 w-9" : "h-11 w-11"
              )}
            >
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className={cn("truncate font-display uppercase tracking-wide text-white", compact ? "text-lg" : "text-xl")}>
                Tara&apos;s 30th
              </p>
            </div>
          </TransitionLink>

          <div className="flex items-center gap-2">
            {showMobileHome ? (
              <Button asChild variant="outline" size="sm" className="md:hidden">
                <TransitionLink href="/" direction="back">Home</TransitionLink>
              </Button>
            ) : null}

            <nav className="hidden items-center gap-2 md:flex">
              {NAV_LINKS.map((link) => {
                const active = link.match(pathname);

                return (
                  <Button key={link.href} asChild variant={active ? "secondary" : link.href === "/admin" ? "outline" : "ghost"}>
                    <TransitionLink href={link.href}>{link.label}</TransitionLink>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
