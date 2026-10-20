"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { usePostDraft } from "@/components/post-draft-context";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportRow } from "@/components/result/report-row";
import { ModeratedByBadge } from "@/components/result/moderated-by-badge";
import { transitions } from "@/lib/motion";

const CHECKS: { label: string; value: string; flagged?: boolean }[] = [
  { label: "Image content", value: "Passed" },
  { label: "OCR text", value: "Passed" },
  { label: "Sentiment", value: "Negative" },
  { label: "Hate speech", value: "Not detected" },
  { label: "Cyberbullying", value: "Not detected" },
  { label: "Harassment", value: "Flagged", flagged: true },
  { label: "Violence", value: "Not detected" },
  { label: "Threats", value: "Not detected" },
];

const SUGGESTIONS = ["Remove offensive wording", "Replace harmful text", "Upload a different image"];

export default function ResultBlockedPage() {
  const router = useRouter();
  const { draft, outcome, blockedReason, clear } = usePostDraft();

  function handleCancel() {
    clear();
    router.push("/feed");
  }

  if (!draft.previewUrl || outcome !== "blocked") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm font-medium text-foreground">There&apos;s no result to show.</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          This page only works right after a post finishes analysis.
        </p>
        <Button asChild size="lg">
          <Link href="/create">Create a post</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <Container className="flex max-w-lg flex-col items-center gap-6 text-center">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          AI moderation complete
        </span>

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={transitions.spring}
          className="relative"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blocked/25 blur-[60px]"
          />
          <AlertTriangle size={56} className="relative text-blocked" aria-hidden="true" />
        </motion.div>

        <h1 role="status" aria-live="assertive" className="text-heading text-blocked">
          Upload blocked
        </h1>

        <Card elevation={1} className="w-full p-6 text-left">
          {CHECKS.map((row) => (
            <ReportRow key={row.label} label={row.label} value={row.value} flagged={row.flagged} />
          ))}
          <div className="mt-2 flex items-center justify-between pt-3">
            <span className="text-sm font-medium text-foreground">Confidence</span>
            <span className="text-sm font-medium text-blocked">94%</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-medium text-foreground">Risk</span>
            <span className="text-sm font-medium text-blocked">High</span>
          </div>
        </Card>

        <Card elevation={2} className="w-full p-5 text-left">
          <h2 className="mb-1.5 text-sm font-medium text-foreground">Why it was blocked</h2>
          <p className="text-sm text-muted-foreground">
            {blockedReason ?? "The uploaded image contains language that targets another individual in a harmful way."}
          </p>
        </Card>

        <Card elevation={1} className="w-full p-5 text-left">
          <h2 className="mb-2.5 text-sm font-medium text-foreground">Suggestions</h2>
          <ul className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" size="lg" onClick={handleCancel}>
            Cancel upload
          </Button>
          <Button size="lg" asChild>
            <Link href="/create">Edit post</Link>
          </Button>
        </div>

        <ModeratedByBadge />
      </Container>
    </div>
  );
}
