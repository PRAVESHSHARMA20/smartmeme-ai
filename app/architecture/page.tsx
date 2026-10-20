import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/reveal";
import { ArchitecturePipeline } from "@/components/architecture/pipeline";
import { TechStack } from "@/components/architecture/tech-stack";
import { ComparisonSection } from "@/components/architecture/comparison-section";

export default function ArchitecturePage() {
  return (
    <>
      <Navbar />

      <main>
        <section className="pb-16 pt-32 md:pt-40">
          <Container className="flex flex-col items-center gap-4 text-center">
            <Reveal>
              <div className="flex flex-col items-center gap-4">
                <h1 className="max-w-2xl text-heading md:text-4xl">How SmartMeme AI works</h1>
                <p className="max-w-lg text-body text-muted-foreground">
                  Every image is analyzed before it reaches the community.
                </p>
              </div>
            </Reveal>
          </Container>
        </section>

        <section className="pb-20 md:pb-28">
          <Container>
            <ArchitecturePipeline />
          </Container>
        </section>

        <section className="pb-20 md:pb-28">
          <Container>
            <TechStack />
          </Container>
        </section>

        <section className="pb-20 md:pb-28">
          <Container className="max-w-3xl">
            <ComparisonSection />
          </Container>
        </section>
      </main>

      <Footer />
    </>
  );
}
