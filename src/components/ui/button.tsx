import * as React from "react";

import { cn } from "@/lib/utils/cn";

const buttonVariants = {
  default:
    "border-2 border-black bg-accent text-black shadow-[4px_4px_0_rgba(0,0,0,0.95)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_rgba(0,0,0,0.95)] focus-visible:ring-focus",
  secondary:
    "border-2 border-white bg-black text-white shadow-[4px_4px_0_rgba(255,255,255,0.08)] hover:bg-white hover:text-black focus-visible:ring-focus",
  ghost:
    "border-2 border-transparent bg-transparent text-text hover:border-white hover:bg-white/5 focus-visible:ring-focus",
  destructive:
    "border-2 border-black bg-error text-white shadow-[4px_4px_0_rgba(0,0,0,0.95)] hover:translate-y-[1px] hover:shadow-[3px_3px_0_rgba(0,0,0,0.95)] focus-visible:ring-focus",
  outline:
    "border-2 border-white bg-black text-white shadow-[4px_4px_0_rgba(255,255,255,0.08)] hover:bg-white hover:text-black focus-visible:ring-focus"
} as const;

const buttonSizes = {
  default: "h-12 px-4 py-2 text-[0.92rem]",
  sm: "h-10 rounded-md px-3 text-[0.82rem]",
  lg: "h-14 rounded-md px-5 text-base"
} as const;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-md font-body font-semibold uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-60",
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
