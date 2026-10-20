import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/reveal";
import { RoadmapTimeline } from "@/components/roadmap/timeline";
import { FutureEnhancements } from "@/components/roadmap/future-enhancements";
import { VisionStatement } from "@/components/roadmap/vision-statement";

export default function RoadmapPage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="pb-16 pt-32 md:pt-40">
          <Container className="flex flex-col items-center gap-4 text-center">
            <Reveal>
              <div className="flex flex-col items-center gap-4">
                <h1 className="max-w-2xl text-heading md:text-4xl">SmartMeme AI roadmap</h1>
                <p className="max-w-lg text-body text-muted-foreground">
                  Building the future of proactive AI-powered content moderation.
                </p>
              </div>
            </Reveal>
          </Container>
        </section>

        <section className="pb-20 md:pb-28">
          <Container>
            <RoadmapTimeline />
          </Container>
        </section>

        <section className="pb-20 md:pb-28">
          <Container className="max-w-3xl">
            <FutureEnhancements />
          </Container>
        </section>

        <section className="pb-20 md:pb-28">
          <Container>
            <VisionStatement />
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}
