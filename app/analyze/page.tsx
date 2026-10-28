
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
} from "@/lib/analysis-config";

type InsightKey = "ocr" | "objects" | "language" | "emotion" | "risk";

export default function AnalyzePage() {
  const router = useRouter();
  const {
    draft,
    outcome,
    blockedReason,
    sentimentResult,
    setOutcome,
    setSentimentResult,
  } = usePostDraft();

  const [completedCount, setCompletedCount] = React.useState(1);
  const [phase, setPhase] = React.useState<"running" | "revealed">("running");
  const [visibleInsights, setVisibleInsights] =
    React.useState<Set<InsightKey>>(new Set());
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!draft.previewUrl || !draft.imageFile) return;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    async function analyzeMeme() {
      try {
        let elapsed = 0;

        for (let i = 0; i < STAGE_DURATIONS_MS.length; i++) {
          elapsed += STAGE_DURATIONS_MS[i];

          await new Promise<void>((resolve) => {
            timeouts.push(setTimeout(resolve, STAGE_DURATIONS_MS[i]));
          });

          if (cancelled) return;

          const stageIndex = i + 1;
          setCompletedCount(stageIndex + 1);

          const insight = STAGES[stageIndex]?.revealsInsight as
            | InsightKey
            | undefined;

          if (insight) {
            setVisibleInsights((prev) => new Set(prev).add(insight));
          }
        }

        await new Promise<void>((resolve) => {
          timeouts.push(setTimeout(resolve, DECISION_PAUSE_MS));
        });

        if (cancelled) return;

        const formData = new FormData();
        formData.append("image", draft.imageFile!);
        formData.append("caption", draft.caption || "");

        const response = await fetch("http://127.0.0.1:8000/analyze", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "The AI analysis failed.");
        }

        if (cancelled) return;

        setSentimentResult(data);
        setOutcome("safe", "Sentiment prediction completed. Safety has not been assessed.");
        setPhase("revealed");
        setCompletedCount(STAGE_DURATIONS_MS.length + 1);

        // Reuse the existing result page for now. It will be updated next
        // to display sentiment rather than claiming the meme is safe.
        router.push("/result/safe");
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Could not analyze this image.";

        setError(message);
        setPhase("revealed");
      }
    }

    void analyzeMeme();

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [
    draft.previewUrl,
    draft.imageFile,
    draft.caption,
    router,
    setOutcome,
    setSentimentResult,
  ]);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") router.push("/feed");
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (!draft.previewUrl || !draft.imageFile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm font-medium text-foreground">
          There&apos;s no post to analyze.
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Select an image on the Create Post page first.
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
          <h1 className="text-base font-medium text-foreground">
            Analyzing your post
          </h1>
          <button
            type="button"
            onClick={() => router.push("/feed")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
          >
            <p className="font-medium">Analysis failed</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2">
              Check that the backend is running at http://127.0.0.1:8000.
            </p>
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => router.push("/create")}
            >
              Back to upload
            </Button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <PostPreviewPanel
            previewUrl={draft.previewUrl}
            caption={draft.caption}
            phase={phase}
            outcome={outcome}
            sentimentResult={sentimentResult}
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
