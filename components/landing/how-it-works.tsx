import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal, RevealItem } from "@/components/reveal";

const STEPS = [
  {
    title: "You post",
    description: "Share a meme or photo to your feed, just like any other platform.",
  },
  {
    title: "It's checked instantly",
    description: "AI reviews the image and any text in the background — in seconds.",
  },
  {
    title: "Safe posts go live",
    description: "No manual queue, no waiting. Your post reaches your followers right away.",
  },
  {
    title: "Your feed stays clean",
    description: "Harmful posts are stopped before anyone sees them, with a clear reason why.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <Container className="flex flex-col gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Posting feels instant. What happens behind it is what makes it safe."
          />
        </Reveal>

        <Reveal stagger>
          <div className="relative flex flex-col gap-10 md:flex-row md:justify-between md:gap-6">
            <div
              aria-hidden="true"
              className="absolute left-5 top-0 bottom-0 w-px bg-border md:left-0 md:right-0 md:top-5 md:h-px md:w-auto md:bottom-auto"
            />
            {STEPS.map((step, i) => (
              <RevealItem key={step.title} className="relative flex gap-4 md:flex-1 md:flex-col md:gap-4">
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-medium text-foreground">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1 pt-1.5 md:pt-0">
                  <h3 className="text-base font-medium text-foreground">{step.title}</h3>
                  <p className="max-w-[22ch] text-sm text-muted-foreground">{step.description}</p>
                </div>
              </RevealItem>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
