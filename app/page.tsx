import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemStatement } from "@/components/landing/problem-statement";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { ModerationFlow } from "@/components/landing/moderation-flow";
import { CallToAction } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-20 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <ProblemStatement />
        <HowItWorks />
        <FeatureShowcase />
        <ModerationFlow />
        <CallToAction />
      </main>

      <Footer />
    </>
  );
}
