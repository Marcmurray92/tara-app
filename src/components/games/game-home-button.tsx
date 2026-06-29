import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/ui/transition-link";
import { cn } from "@/lib/utils/cn";

export function GameHomeButton({
  className,
  label = "Home",
  size = "sm"
}: {
  className?: string;
  label?: string;
  size?: "default" | "sm" | "lg";
}) {
  return (
    <Button asChild variant="outline" size={size} className={cn("rounded-full px-3", className)}>
      <TransitionLink href="/" direction="back" aria-label="Back to Home">
        <Home className="h-4 w-4" />
        {label}
      </TransitionLink>
    </Button>
  );
}
