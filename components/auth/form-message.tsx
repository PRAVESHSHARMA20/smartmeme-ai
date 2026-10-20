"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/motion";

interface FormMessageProps {
  variant: "error" | "success";
  children: React.ReactNode;
}

/**
 * Announced via aria-live so screen reader users hear the submission
 * outcome without focus being moved — used identically by Login and
 * Signup so the "something happened" moment feels the same everywhere.
 */
export function FormMessage({ variant, children }: FormMessageProps) {
  const isError = variant === "error";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={variant}
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={transitions.spring}
        className={cn(
          "flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm",
          isError ? "border-blocked/30 bg-blocked/10 text-blocked" : "border-safe/30 bg-safe/10 text-safe"
        )}
      >
        {isError ? (
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        ) : (
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        )}
        <span className="text-foreground/90">{children}</span>
      </motion.div>
    </AnimatePresence>
  );
}
