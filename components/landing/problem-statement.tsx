import { AlertTriangle, Clock, MessagesSquare } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal, RevealItem } from "@/components/reveal";

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: "Reported after it spreads",
    description:
      "By the time someone flags a post, it's already been seen, screenshotted, and shared beyond the platform.",
  },
  {
    icon: Clock,
    title: "Reviewed by a slow queue",
    description:
      "Human review teams work through reports in the order they arrive — hours or days after the harm started.",
  },
  {
    icon: MessagesSquare,
    title: "Damage is already done",
    description:
      "For the person targeted, takedown after the fact doesn't undo being seen, mocked, or threatened in public.",
  },
];

export function ProblemStatement() {
  return (
    <section className="py-20 md:py-28">
      <Container className="flex flex-col gap-14">
        <Reveal>
          <SectionHeading
            eyebrow="Why it's built in"
            title="Other feeds react. This one won't have to."
            description="Most platforms review content reactively — after a report, after it's spread, after someone's already been hurt by it."
          />
        </Reveal>

        <Reveal stagger>
          <div className="grid gap-4 md:grid-cols-3">
            {PROBLEMS.map(({ icon: Icon, title, description }) => (
              <RevealItem key={title}>
                <Card className="h-full p-6">
                  <CardContent className="flex h-full flex-col gap-3 p-0">
                    <Icon size={20} className="text-muted-foreground" aria-hidden="true" />
                    <h3 className="text-base font-medium text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              </RevealItem>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
