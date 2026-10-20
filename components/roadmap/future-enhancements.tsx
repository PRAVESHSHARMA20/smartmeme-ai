import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal, RevealItem } from "@/components/reveal";
import { FUTURE_ENHANCEMENTS } from "@/lib/roadmap-config";

export function FutureEnhancements() {
  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <SectionHeading eyebrow="Beyond the roadmap" title="Future enhancements" />
      </Reveal>

      <Reveal stagger>
        <div className="grid gap-3 sm:grid-cols-2">
          {FUTURE_ENHANCEMENTS.map((item) => (
            <RevealItem key={item}>
              <Card elevation={1} className="flex items-center gap-3 p-4">
                <Sparkles size={16} className="shrink-0 text-accent" aria-hidden="true" />
                <span className="text-sm text-foreground">{item}</span>
              </Card>
            </RevealItem>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
