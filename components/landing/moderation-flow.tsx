import { Check, X } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";

const CHECKS = ["Image content", "Embedded text", "Sentiment", "Hate speech & harassment"];

export function ModerationFlow() {
  return (
    <section id="moderation-flow" className="py-20 md:py-28">
      <Container className="flex flex-col gap-14">
        <Reveal>
          <SectionHeading
            eyebrow="Our unique safeguard"
            title="Every post gets the same quick check — before anyone sees it."
            description="Nothing is hidden from the person posting. They see exactly what was flagged and why."
          />
        </Reveal>

        <Reveal>
          <GlassPanel className="grid overflow-hidden md:grid-cols-2">
            {/* Safe outcome */}
            <div className="flex flex-col gap-5 border-b border-border/60 p-6 md:border-b-0 md:border-r md:p-8">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Example — allowed
              </span>
              <ul className="flex flex-col gap-2.5">
                {CHECKS.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-safe bg-safe/15">
                      <Check size={10} className="text-safe" strokeWidth={3} />
                    </span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div>
                <Badge variant="safe">Verified safe</Badge>
                <p className="mt-3 text-sm text-muted-foreground">
                  Published immediately — no manual review needed.
                </p>
              </div>
            </div>

            {/* Blocked outcome */}
            <div className="flex flex-col gap-5 p-6 md:p-8">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Example — blocked
              </span>
              <ul className="flex flex-col gap-2.5">
                {CHECKS.map((item, i) => {
                  const flagged = i === 3;
                  return (
                    <li key={item} className="flex items-center gap-2.5 text-sm">
                      <span
                        className={
                          "flex h-4 w-4 items-center justify-center rounded-full border " +
                          (flagged ? "border-blocked bg-blocked/15" : "border-safe bg-safe/15")
                        }
                      >
                        {flagged ? (
                          <X size={10} className="text-blocked" strokeWidth={3} />
                        ) : (
                          <Check size={10} className="text-safe" strokeWidth={3} />
                        )}
                      </span>
                      <span className={flagged ? "text-foreground" : "text-muted-foreground"}>{item}</span>
                    </li>
                  );
                })}
              </ul>
              <div>
                <Badge variant="blocked">Blocked</Badge>
                <p className="mt-3 text-sm text-muted-foreground">
                  Caption contains language directed at and demeaning a specific
                  person. The uploader sees this exact reason.
                </p>
              </div>
            </div>
          </GlassPanel>
        </Reveal>
      </Container>
    </section>
  );
}
