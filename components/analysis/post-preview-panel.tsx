import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PostOutcome } from "@/components/post-draft-context";

interface PostPreviewPanelProps {
  previewUrl: string;
  caption: string;
  phase: "running" | "revealed";
  outcome: PostOutcome | null;
}

export function PostPreviewPanel({ previewUrl, caption, phase, outcome }: PostPreviewPanelProps) {
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

      <div className={cn("mx-4 overflow-hidden rounded-md transition-all duration-500", ringClass)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="Your uploaded post, pending review" className="aspect-square w-full object-cover" />
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
