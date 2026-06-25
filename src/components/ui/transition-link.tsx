"use client";

import Link, { type LinkProps } from "next/link";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { forwardRef, useContext } from "react";

import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

type TransitionLinkProps = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    direction?: "forward" | "back" | "fade";
  };

function inferDirection(currentPathname: string, targetPathname: string) {
  if (currentPathname === "/" && targetPathname.startsWith("/games")) {
    return "forward" as const;
  }

  if (currentPathname.startsWith("/games") && targetPathname === "/") {
    return "back" as const;
  }

  return "fade" as const;
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(function TransitionLink(
  { href, onClick, direction, children, ...props },
  ref
) {
  const router = useContext(AppRouterContext);
  const pathname = useContext(PathnameContext) ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const prefersReducedMotion = usePrefersReducedMotion();
  const targetHref = typeof href === "string" ? href : href.toString();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      prefersReducedMotion ||
      props.target === "_blank" ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !targetHref.startsWith("/") ||
      targetHref === pathname ||
      !router
    ) {
      return;
    }

    event.preventDefault();

    const root = document.documentElement;
    const transitionDirection = direction ?? inferDirection(pathname, targetHref);

    root.classList.remove("page-transition-in");
    root.classList.add(`page-transition-out-${transitionDirection}`);

    window.setTimeout(() => {
      router.push(targetHref);
    }, 170);
  }

  return (
    <Link ref={ref} href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
});
