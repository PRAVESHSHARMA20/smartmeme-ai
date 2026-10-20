"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostDraft } from "@/components/post-draft-context";
import { PostPreviewPanel } from "@/components/analysis/post-preview-panel";
import { PipelinePanel } from "@/components/analysis/pipeline-panel";
import { InsightsPanel } from "@/components/analysis/insights-panel";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  STAGES,
  STAGE_DURATIONS_MS,
  DECISION_PAUSE_MS,
  SAFE_REDIRECT_DELAY_MS,
  BLOCKED_REDIRECT_DELAY_MS,
  resolveOutcome,
} from "@/lib/analysis-config";

type InsightKey = "ocr" | "objects" | "language" | "emotion" | "risk";

export default function AnalyzePage() {
  const router = useRouter();
  const { draft, outcome, blockedReason, setOutcome } = usePostDraft();

  // Stage 0 ("Upload complete") is pre-completed from the very first render —
  // this is a fixed default, not derived from any browser API, so it's
  // identical on server and client and can't cause a hydration mismatch.
  const [completedCount, setCompletedCount] = React.useState(1);
  const [phase, setPhase] = React.useState<"running" | "revealed">("running");
  const [visibleInsights, setVisibleInsights] = React.useState<Set<InsightKey>>(new Set());

  React.useEffect(() => {
    if (!draft.previewUrl) return; // handled by the empty-state guard below

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let cumulative = 0;

    STAGE_DURATIONS_MS.forEach((duration, i) => {
      cumulative += duration;
      const stageIndex = i + 1; // offset by the pre-completed "upload" stage
      timeouts.push(
        setTimeout(() => {
          setCompletedCount(stageIndex + 1);
          const insight = STAGES[stageIndex]?.revealsInsight as InsightKey | undefined;
          if (insight) setVisibleInsights((prev) => new Set(prev).add(insight));
        }, cumulative)
      );
    });

    timeouts.push(
      setTimeout(() => {
        const resolved = resolveOutcome(draft.caption);
        setOutcome(resolved.outcome, resolved.reason);
        setPhase("revealed");

        const redirectDelay = resolved.outcome === "blocked" ? BLOCKED_REDIRECT_DELAY_MS : SAFE_REDIRECT_DELAY_MS;
        timeouts.push(setTimeout(() => router.push(`/result/${resolved.outcome}`), redirectDelay));
      }, cumulative + DECISION_PAUSE_MS)
    );

    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.previewUrl]);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") router.push("/feed");
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (!draft.previewUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm font-medium text-foreground">There&apos;s no post to analyze.</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          This page only works right after selecting an image in Create Post.
        </p>
        <Button asChild size="lg">
          <Link href="/create">Create a post</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <Container className="pt-8 sm:pt-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-base font-medium text-foreground">Analyzing your post</h1>
          <button
            type="button"
            onClick={() => router.push("/feed")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <PostPreviewPanel
            previewUrl={draft.previewUrl}
            caption={draft.caption}
            phase={phase}
            outcome={outcome}
          />

          <div className="flex flex-col gap-6">
            <PipelinePanel
              completedCount={completedCount}
              phase={phase}
              outcome={outcome}
              blockedReason={blockedReason}
            />
            <InsightsPanel visible={visibleInsights} outcome={outcome} />
          </div>
        </div>
      </Container>
    </div>
  );
}
