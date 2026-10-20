"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { transitions } from "@/lib/motion";

const CHECKLIST = [
  "Image content",
  "Embedded text",
  "Sentiment",
  "Hate speech & harassment",
];

const STEP_DELAY_MS = 550;
const HOLD_MS = 2200;
const RESET_MS = 900;

/**
 * The one bold, memorable element on the landing page. Everything else on
 * this page is calm by design — this card is where we spend that boldness,
 * because it *is* the product's core mechanic, not decoration.
 */
export function ModerationPreviewCard() {
  const prefersReducedMotion = useReducedMotion();
  // Server has no window, so useReducedMotion() can only resolve the real
  // value after mount. Both server and the client's first render must start
  // from the SAME default (0 / false) or React throws a hydration mismatch
  // for anyone with reduced-motion enabled. The reduced-motion branch is
  // applied only inside the effect below, after hydration has settled —
  // same "mounted gate" pattern as ThemeToggle.
  const [completedSteps, setCompletedSteps] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      // Static end-state only — no timers, no loop.
      setCompletedSteps(CHECKLIST.length);
      setShowResult(true);
      return;
    }

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function runCycle() {
      setCompletedSteps(0);
      setShowResult(false);

      CHECKLIST.forEach((_, i) => {
        timeouts.push(
          setTimeout(() => {
            if (!cancelled) setCompletedSteps(i + 1);
          }, STEP_DELAY_MS * (i + 1))
        );
      });

      const resultDelay = STEP_DELAY_MS * CHECKLIST.length + 300;
      timeouts.push(
        setTimeout(() => {
          if (!cancelled) setShowResult(true);
        }, resultDelay)
      );

      timeouts.push(
        setTimeout(() => {
          if (!cancelled) runCycle();
        }, resultDelay + HOLD_MS + RESET_MS)
      );
    }

    runCycle();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [prefersReducedMotion]);

  const scanning = completedSteps < CHECKLIST.length;

  return (
    <Card
      elevation={2}
      className="mx-auto w-full max-w-sm overflow-hidden p-5"
      role="img"
      aria-label="Illustration of SmartMeme AI scanning a post and marking it verified safe"
    >
      {/* Mock chrome to read as "a post," not just an abstract shape */}
      <div className="mb-4 flex items-center gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
      </div>

      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-md bg-surface-2" aria-hidden="true">
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon size={28} className="text-muted-foreground/50" />
        </div>

        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ top: "-10%" }}
              animate={{ top: "110%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
              className="absolute left-0 h-10 w-full bg-gradient-to-b from-transparent via-accent/25 to-transparent"
            />
          )}
        </AnimatePresence>
      </div>

      <ul className="mb-4 flex flex-col gap-2.5">
        {CHECKLIST.map((item, i) => {
          const done = i < completedSteps;
          return (
            <li key={item} className="flex items-center gap-2.5 text-sm">
              <span
                className={
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 " +
                  (done ? "border-safe bg-safe/15" : "border-border")
                }
              >
                {done && <Check size={10} className="text-safe" strokeWidth={3} />}
              </span>
              <span className={done ? "text-foreground" : "text-muted-foreground"}>{item}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex h-7 items-center">
        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={transitions.spring}
            >
              <Badge variant="safe">
                <Check size={12} strokeWidth={3} />
                Verified safe — published
              </Badge>
            </motion.div>
          ) : (
            <motion.span
              key="scanning-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground"
            >
              Analyzing before publishing…
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
