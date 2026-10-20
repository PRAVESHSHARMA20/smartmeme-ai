import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";
import type { Milestone } from "@/lib/roadmap-config";

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    badgeVariant: "safe" as const,
    marker: "border-safe bg-safe text-safe-foreground",
  },
  planned: {
    label: "Planned",
    badgeVariant: "accent" as const,
    marker: "border-accent bg-background text-accent",
  },
  future: {
    label: "Future",
    badgeVariant: "outline" as const,
    marker: "border-dashed border-border bg-background text-muted-foreground",
  },
};

export function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const status = STATUS_CONFIG[milestone.status];

  return (
    <motion.li variants={fadeUp} className="relative flex gap-4">
      <span
        className={cn(
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium",
          status.marker
        )}
      >
        {milestone.status === "completed" ? <Check size={16} strokeWidth={3} aria-hidden="true" /> : null}
      </span>

      <Card elevation={1} className="flex-1 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {milestone.phase}
          </span>
          <Badge variant={status.badgeVariant}>{status.label}</Badge>
        </div>

        <h3 className="mt-1.5 text-base font-medium text-foreground">{milestone.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {milestone.includes.map((item) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>

        <div className="mt-4 border-t border-border/60 pt-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Estimated outcome
          </span>
          <p className="mt-1 text-sm text-foreground">{milestone.outcome}</p>
        </div>
      </Card>
    </motion.li>
  );
}
