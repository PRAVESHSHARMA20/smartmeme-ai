"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/motion";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md",
    "text-sm font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-accent/90",
        secondary: "bg-surface-2 text-foreground hover:bg-surface-2/70",
        outline: "border border-border bg-transparent hover:bg-surface-1",
        ghost: "bg-transparent hover:bg-surface-1 text-muted-foreground hover:text-foreground",
        destructive: "bg-blocked text-blocked-foreground hover:bg-blocked/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // asChild (e.g. rendering a Next.js <Link> as a button) skips the motion
    // wrapper since Slot requires a single passthrough child.
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, className }))} {...props} />
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.98 }}
        transition={transitions.spring}
        className={cn(buttonVariants({ variant, size, className }))}
        {...(props as React.ComponentProps<typeof motion.button>)}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
