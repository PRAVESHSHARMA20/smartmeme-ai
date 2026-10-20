import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

export function CallToAction() {
  return (
    <section className="py-20 md:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-lg border border-border bg-surface-1 px-6 py-16 text-center md:px-16 md:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-accent/20 opacity-30 blur-[110px]"
            />
            <div className="relative flex flex-col items-center gap-6">
              <h2 className="max-w-lg text-heading md:text-3xl">
                Your feed. Your people. Protected by default.
              </h2>
              <p className="max-w-md text-body text-muted-foreground">
                Join SmartMeme and start sharing memes with people you
                follow — every post checked before it reaches your feed.
              </p>
              <Button size="lg" asChild>
                <Link href="/signup">
                  Join the feed
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
