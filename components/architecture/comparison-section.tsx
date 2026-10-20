import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal } from "@/components/reveal";

const ROWS = [
  { traditional: "Content removed after posting", proactive: "Content analyzed before posting" },
  { traditional: "Relies on user reports", proactive: "Runs automatically on every upload" },
  { traditional: "Harm is already visible", proactive: "Harm is stopped before publishing" },
  { traditional: "Slow, manual review queues", proactive: "Instant automated decision" },
];

export function ComparisonSection() {
  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <SectionHeading eyebrow="Why SmartMeme AI" title="Proactive moderation, not reactive cleanup" />
      </Reveal>

      <Reveal>
        <Card elevation={1} className="overflow-x-auto p-0">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <caption className="sr-only">Comparison of traditional versus SmartMeme AI moderation</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-5 py-3.5 font-medium text-muted-foreground">
                  Traditional moderation
                </th>
                <th scope="col" className="px-5 py-3.5 font-medium text-safe">
                  SmartMeme AI
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.traditional} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3.5 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <X size={14} className="shrink-0 text-blocked" aria-hidden="true" />
                      {row.traditional}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-foreground">
                    <span className="flex items-center gap-2">
                      <Check size={14} className="shrink-0 text-safe" aria-hidden="true" />
                      {row.proactive}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Reveal>

      <Reveal>
        <div className="rounded-lg border border-accent/30 bg-accent/[0.04] p-5 text-center">
          <p className="text-sm text-foreground">
            Proactive, before-publish moderation is this project&apos;s unique contribution — most platforms
            only react after harm is already visible.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
