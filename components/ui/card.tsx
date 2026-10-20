"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/motion";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Elevation communicates depth via layered surfaces, not shadows. */
  elevation?: 1 | 2;
  /** Enables hover lift + cursor-pointer + border brighten, for cards that are themselves a click target (e.g. a link-wrapped feature card). */
  interactive?: boolean;
  /** Enables the same hover lift as `interactive`, but without cursor-pointer — for cards that contain their own interactive children (feed posts) rather than being a click target themselves. */
  hoverLift?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation = 1, interactive = false, hoverLift = false, ...props }, ref) => {
    const animatesOnHover = interactive || hoverLift;
    const Comp = animatesOnHover ? motion.div : "div";
    const motionProps = animatesOnHover
      ? {
          whileHover: { y: -2 },
          transition: transitions.spring,
        }
      : {};

    return (
      <Comp
        ref={ref}
        className={cn(
          "rounded-lg border border-border",
          elevation === 1 ? "bg-surface-1" : "bg-surface-2",
          interactive && "cursor-pointer hover:border-border/60",
          hoverLift && "hover:border-accent/20 transition-colors",
          className
        )}
        {...motionProps}
        {...(props as React.ComponentProps<typeof motion.div>)}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-heading", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 pb-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center px-6 pb-6", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
