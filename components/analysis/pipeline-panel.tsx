"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/motion";
import { STAGES } from "@/lib/analysis-config";
import type { PostOutcome } from "@/components/post-draft-context";

interface PipelinePanelProps {
  completedCount: number;
  phase: "running" | "revealed";
  outcome: PostOutcome | null;
  blockedReason: string | null;
}

export function PipelinePanel({ completedCount, phase, outcome, blockedReason }: PipelinePanelProps) {
  const currentStage = STAGES[Math.min(completedCount, STAGES.length - 1)];
  const progressPct = Math.round((completedCount / STAGES.length) * 100);

  return (
    <Card elevation={1} className="overflow-hidden p-5 sm:p-6">
      {/* Announces stage changes without re-announcing every frame */}
      <span className="sr-only" aria-live="polite">
        {phase === "running" ? currentStage?.label : ""}
      </span>

      <AnimatePresence mode="wait">
        {phase === "running" ? (
          <motion.div
            key="checklist"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.exit}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Analyzing post</span>
                <span>{progressPct}%</span>
              </div>
              <div
                role="progressbar"
                aria-label="Analysis progress"
                aria-valuenow={completedCount}
                aria-valuemin={0}
                aria-valuemax={STAGES.length}
                className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
              >
                <motion.div
                  className="h-full rounded-full bg-accent"
                  animate={{ width: `${progressPct}%` }}
                  transition={transitions.entrance}
                />
              </div>
            </div>

            <ul className="flex flex-col gap-2.5">
              {STAGES.map((stage, i) => {
                const status = i < completedCount ? "completed" : i === completedCount ? "running" : "waiting";
                return (
                  <li key={stage.id} className="flex items-center gap-3">
                    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                      {status === "completed" && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-safe/15">
                          <Check size={11} className="text-safe" strokeWidth={3} aria-hidden="true" />
                        </span>
                      )}
                      {status === "running" && (
                        <motion.span
                          animate={{ scale: [1, 1.25, 1], opacity: [1, 0.6, 1] }}
                          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                          className="h-2.5 w-2.5 rounded-full bg-accent"
                        />
                      )}
                      {status === "waiting" && (
                        <span className="h-2.5 w-2.5 rounded-full border border-border" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-sm transition-colors duration-300",
                        status === "running" && "font-medium text-foreground",
                        status === "completed" && "text-muted-foreground",
                        status === "waiting" && "text-muted-foreground/50"
                      )}
                    >
                      {stage.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : (
          <motion.div
            key="decision"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transitions.spring}
            role="status"
            aria-live="assertive"
            className="relative flex flex-col items-center gap-3 py-6 text-center"
          >
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]",
                outcome === "blocked" ? "bg-blocked/25" : "bg-safe/25"
              )}
            />
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...transitions.spring, delay: 0.1 }}
              className="relative"
            >
              {outcome === "blocked" ? (
                <AlertTriangle size={44} className="text-blocked" aria-hidden="true" />
              ) : (
                <CheckCircle2 size={44} className="text-safe" aria-hidden="true" />
              )}
            </motion.div>
            <div className="relative flex flex-col gap-1">
              <span className={cn("text-lg font-medium", outcome === "blocked" ? "text-blocked" : "text-safe")}>
                {outcome === "blocked" ? "Harmful content detected" : "Safe to publish"}
              </span>
              <span className="max-w-xs text-sm text-muted-foreground">
                {outcome === "blocked"
                  ? blockedReason ?? "This post doesn't meet our community guidelines."
                  : "Your post passed every check and is being published."}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
