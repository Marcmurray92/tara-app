import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border-2 border-white px-2.5 py-1 font-body text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted",
        className
      )}
      {...props}
    />
  );
}
