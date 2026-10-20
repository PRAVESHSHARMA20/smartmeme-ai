"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart, MessageCircle, Send, ImageIcon, Loader2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { transitions } from "@/lib/motion";

const VERIFY_DELAY_MS = 1500;

/**
 * The hero's signature visual — but now it reads as an ordinary feed post
 * first, and an AI platform second. Moderation shows up only as a small
 * "Checking…" -> checkmark swap next to the timestamp, the way Instagram
 * shows "Posting…" -> done. It resolves once and stays resolved — a real
 * post gets verified a single time, so this doesn't loop like a demo reel.
 */
export function SocialPostPreviewCard() {
  const prefersReducedMotion = useReducedMotion();
  // Same mounted-gate pattern as ThemeToggle/the previous card: both server
  // and the client's first render must start "verified: false" so hydration
  // can't mismatch for users with reduced motion enabled.
  const [verified, setVerified] = React.useState(false);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setVerified(true);
      return;
    }
    const timeout = setTimeout(() => setVerified(true), VERIFY_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [prefersReducedMotion]);

  return (
    <Card elevation={2} className="mx-auto w-full max-w-sm overflow-hidden">
      {/* Post header */}
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-medium text-foreground">
          M
        </div>
        <div className="flex flex-1 flex-col leading-tight">
          <span className="text-sm font-medium text-foreground">mia.creates</span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>2m</span>
            <span aria-hidden="true">·</span>
            <AnimatePresence mode="wait">
              {verified ? (
                <motion.span
                  key="verified"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={transitions.spring}
                  className="flex items-center gap-1 text-safe"
                >
                  <ShieldCheck size={12} aria-hidden="true" />
                  Protected
                </motion.span>
              ) : (
                <motion.span
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1"
                >
                  <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                  Checking
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Post media */}
      <div className="aspect-square w-full bg-surface-2" aria-hidden="true">
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon size={32} className="text-muted-foreground/40" />
        </div>
      </div>

      {/* Post actions */}
      <div className="flex items-center gap-4 px-4 pt-3 text-foreground">
        <Heart size={20} aria-hidden="true" />
        <MessageCircle size={20} aria-hidden="true" />
        <Send size={19} aria-hidden="true" />
      </div>

      {/* Post caption */}
      <div className="flex flex-col gap-1 p-4 pt-2">
        <span className="text-sm font-medium text-foreground">128 likes</span>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">mia.creates</span>{" "}
          when the wifi finally comes back on 😅
        </p>
      </div>
    </Card>
  );
}
