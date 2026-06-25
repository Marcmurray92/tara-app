import * as React from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = {
  default:
    "bg-accent text-white hover:bg-[color:var(--color-accent-strong)] focus-visible:ring-focus",
  secondary:
    "bg-surface-strong text-text hover:bg-white/10 focus-visible:ring-focus",
  ghost:
    "bg-transparent text-text hover:bg-white/5 focus-visible:ring-focus",
  destructive:
    "bg-error text-white hover:opacity-90 focus-visible:ring-focus",
  outline:
    "border border-border bg-transparent text-text hover:border-accent/70 hover:bg-white/5 focus-visible:ring-focus"
} as const;

const buttonSizes = {
  default: "h-11 px-4 py-2 text-sm",
  sm: "h-9 rounded-md px-3 text-sm",
  lg: "h-12 rounded-lg px-5 text-base"
} as const;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.985] disabled:pointer-events-none disabled:opacity-60",
      buttonVariants[variant],
      buttonSizes[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      const child = React.Children.only(children) as React.ReactElement<{
        className?: string;
      }>;

      return React.cloneElement(child, {
        ...(props as Record<string, unknown>),
        className: cn(classes, child.props.className)
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
