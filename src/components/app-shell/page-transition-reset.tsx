"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageTransitionReset() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("page-transition-out-forward", "page-transition-out-back", "page-transition-out-fade");
    root.classList.add("page-transition-in");

    const cleanupId = window.setTimeout(() => {
      root.classList.remove("page-transition-in");
    }, 320);

    const focusId = window.setTimeout(() => {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>("[data-page-title='true']"));
      const target =
        candidates.find((candidate) => {
          const style = window.getComputedStyle(candidate);
          return style.display !== "none" && style.visibility !== "hidden";
        }) ?? candidates[0];
      target?.focus({ preventScroll: true });
    }, 120);

    return () => {
      window.clearTimeout(cleanupId);
      window.clearTimeout(focusId);
    };
  }, [pathname]);

  return null;
}
