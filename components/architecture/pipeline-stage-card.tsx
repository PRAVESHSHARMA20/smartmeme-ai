"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeUp, transitions } from "@/lib/motion";
import type { PipelineStage } from "@/lib/architecture-config";

interface PipelineStageCardProps {
  stage: PipelineStage;
  index: number;
}

export function PipelineStageCard({ stage, index }: PipelineStageCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <motion.li variants={fadeUp} className="relative flex gap-4">
      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-medium text-foreground">
        {index + 1}
      </span>

      <Card
        elevation={1}
        tabIndex={0}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
        className="flex-1 p-4 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
      >
        <h3 className="text-sm font-medium text-foreground">{stage.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{stage.short}</p>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.p
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 8 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={transitions.entrance}
              className="overflow-hidden text-sm text-muted-foreground"
            >
              {stage.detail}
            </motion.p>
          )}
        </AnimatePresence>

        {stage.subitems && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stage.subitems.map((item) => (
              <Badge key={item} variant="outline">
                {item}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </motion.li>
  );
}
