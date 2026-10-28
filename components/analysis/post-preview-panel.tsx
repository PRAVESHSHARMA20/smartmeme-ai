import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PostOutcome, SentimentResult } from "@/components/post-draft-context";

interface PostPreviewPanelProps {
  previewUrl: string;
  caption: string;
  phase: "running" | "revealed";
  outcome: PostOutcome | null;
  sentimentResult: SentimentResult | null;
}

export function PostPreviewPanel({ previewUrl, caption, phase, outcome, sentimentResult }: PostPreviewPanelProps) {
  const ringClass =
    phase === "revealed"
      ? outcome === "blocked"
        ? "ring-2 ring-blocked/50"
        : "ring-2 ring-safe/50"
      : "ring-2 ring-accent/30";

  return (
    <Card elevation={1} className="sticky top-20 overflow-hidden lg:top-24">
      <div className="flex items-center gap-3 p-4">
        <Avatar name="You" size="md" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-foreground">You</span>
          <span className="text-xs text-muted-foreground">@you · Just now</span>
        </div>
      </div>

      <div className={cn("relative mx-4 overflow-hidden rounded-md transition-all duration-500", ringClass)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Your uploaded meme with its analysis overlay"
          className="aspect-square w-full object-cover"
        />

        {phase === "revealed" && sentimentResult && (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3">
            <div className="flex justify-start">
              <span className="rounded-full border border-white/20 bg-black/75 px-3 py-1.5 text-xs font-semibold capitalize text-white shadow-lg backdrop-blur-sm">
                Sentiment: {sentimentResult.sentiment.replaceAll("_", " ")}
              </span>
            </div>
            <div className="flex justify-end">
              <span className="rounded-md border border-white/15 bg-black/70 px-2.5 py-1.5 text-[10px] font-bold tracking-wide text-white shadow-lg backdrop-blur-sm">
                SMARTMEME AI
              </span>
            </div>
          </div>
        )}
      </div>

      {caption && (
        <p className="px-4 py-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">you</span> {caption}
        </p>
      )}
      {!caption && <div className="pb-4" />}
    </Card>
  );
}
