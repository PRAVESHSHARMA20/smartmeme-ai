"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { transitions } from "@/lib/motion";
import type { PostOutcome } from "@/components/post-draft-context";

type InsightKey = "ocr" | "objects" | "language" | "emotion" | "risk";

interface InsightsPanelProps {
  visible: Set<InsightKey>;
  outcome: PostOutcome | null;
}

export function InsightsPanel({ visible, outcome }: InsightsPanelProps) {
  const rows: { key: InsightKey; label: string; value: string; tone?: "safe" | "blocked" }[] = [
    { key: "objects", label: "Detected objects", value: "Person, text overlay, meme format" },
    { key: "language", label: "Detected language", value: "English" },
    { key: "ocr", label: "OCR confidence", value: "98%" },
    {
      key: "emotion",
      label: "Detected emotion",
      value: outcome === "blocked" ? "Hostile" : "Humorous",
      tone: outcome === "blocked" ? "blocked" : "safe",
    },
    {
      key: "risk",
      label: "Risk level",
      value: outcome === "blocked" ? "High" : "Low",
      tone: outcome === "blocked" ? "blocked" : "safe",
    },
  ];

  const anyVisible = visible.size > 0;

  return (
    <Card elevation={1}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">AI insights</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {!anyVisible && (
          <p className="text-sm text-muted-foreground">Insights will appear as the analysis runs…</p>
        )}
        <AnimatePresence>
          {rows
            .filter((row) => visible.has(row.key))
            .map((row) => (
              <motion.div
                key={row.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transitions.entrance}
                className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span
                  className={
                    "text-sm font-medium " +
                    (row.tone === "blocked"
                      ? "text-blocked"
                      : row.tone === "safe"
                        ? "text-safe"
                        : "text-foreground")
                  }
                >
                  {row.value}
                </span>
              </motion.div>
            ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
