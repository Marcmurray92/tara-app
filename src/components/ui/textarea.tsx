import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[140px] w-full rounded-lg border border-border bg-surface-strong px-3 py-3 text-sm text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

