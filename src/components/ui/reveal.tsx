"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils/cn";

export function Reveal({
  children,
  delay = 0,
  disabled = false,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  disabled?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setVisible(true);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [disabled]);

  return (
    <div
      className={cn(
        "transition-[opacity,transform] duration-300 ease-out motion-reduce:transform-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className
      )}
      style={visible ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
