"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { transitions } from "@/lib/motion";

interface ToastProps {
  message: string;
  open: boolean;
  onClose: () => void;
  /** Auto-dismiss duration in ms. Set to 0 to require manual dismissal. */
  duration?: number;
}

/**
 * Fixed bottom-center on every breakpoint — one consistent placement and
 * visual language for every confirmation in the app, rather than each
 * screen inventing its own "it worked" banner.
 */
export function Toast({ message, open, onClose, duration = 3200 }: ToastProps) {
  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(onClose, duration);
    return () => clearTimeout(timeout);
  }, [open, duration, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={transitions.spring}
          className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-6"
        >
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-full border border-border bg-surface-1 px-4 py-2.5 text-sm text-foreground shadow-lg"
          >
            <CheckCircle2 size={16} className="text-safe" aria-hidden="true" />
            {message}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
