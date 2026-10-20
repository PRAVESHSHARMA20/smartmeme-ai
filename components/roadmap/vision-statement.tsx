import { ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/reveal";

export function VisionStatement() {
  return (
    <Reveal>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-lg border border-accent/30 bg-accent/[0.04] p-8 text-center">
        <ShieldCheck size={20} className="text-accent" aria-hidden="true" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Project vision
        </span>
        <p className="text-base text-foreground">
          &ldquo;Creating a safer online community through proactive AI moderation before harmful
          content reaches the public.&rdquo;
        </p>
      </div>
    </Reveal>
  );
}
