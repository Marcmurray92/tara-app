import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/ui/transition-link";
import { cn } from "@/lib/utils/cn";

export function GameHomeButton({
  ariaLabel,
  className,
  label = "Home",
  size = "sm"
}: {
  ariaLabel?: string;
  className?: string;
  label?: string;
  size?: "default" | "sm" | "lg";
}) {
  return (
    <Button asChild variant="outline" size={size} className={cn("rounded-full px-3", className)}>
      <TransitionLink href="/" direction="back" aria-label={ariaLabel ?? label}>
        <Home className="h-4 w-4" />
        {label}
      </TransitionLink>
    </Button>
  );
}
