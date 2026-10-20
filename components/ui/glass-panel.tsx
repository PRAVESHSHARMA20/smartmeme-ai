import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Deliberately used in exactly two places in this product: the fixed top nav
 * and the AI Analysis panel (to read as a distinct, focused layer above the
 * app). Do not reach for this on cards or buttons — see design brief.
 */
const GlassPanel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("glass rounded-lg border border-border/60", className)}
      {...props}
    />
  )
);
GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
