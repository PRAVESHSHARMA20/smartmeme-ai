import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
import { PipelineStageCard } from "@/components/architecture/pipeline-stage-card";
import { PIPELINE_STAGES } from "@/lib/architecture-config";

export function ArchitecturePipeline() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10">
      <Reveal stagger>
        <div className="relative">
          <div aria-hidden="true" className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <ol className="flex flex-col gap-4">
            {PIPELINE_STAGES.map((stage, i) => (
              <PipelineStageCard key={stage.title} stage={stage} index={i} />
            ))}
          </ol>
        </div>
      </Reveal>

      <Reveal>
        <div className="flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground">Then, one of two outcomes:</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card elevation={1} className="flex flex-col gap-2 border-safe/30 p-5">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-safe" aria-hidden="true" />
                <span className="text-sm font-medium text-safe">Safe → Publish</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The post goes live in the feed immediately — this is what you saw in the demo.
              </p>
            </Card>
            <Card elevation={1} className="flex flex-col gap-2 border-blocked/30 p-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-blocked" aria-hidden="true" />
                <span className="text-sm font-medium text-blocked">Blocked → Explain & suggest</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The uploader sees exactly what was flagged, with plain-language suggestions to fix it.
              </p>
            </Card>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
