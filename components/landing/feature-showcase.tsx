import { LayoutGrid, Heart, Users, Zap, ShieldCheck, MessageCircleWarning } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/layout/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealItem } from "@/components/reveal";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "A feed you follow",
    description: "See posts from the people you follow, newest first, just like you'd expect.",
  },
  {
    icon: Heart,
    title: "Likes & comments",
    description: "React and reply in real time — the everyday social stuff, done right.",
  },
  {
    icon: Users,
    title: "Profiles to explore",
    description: "Every account has a profile with their posts, all in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Built-in AI moderation",
    description: "Every upload is automatically checked for harm before it ever reaches the feed.",
    highlight: true,
  },
  {
    icon: Zap,
    title: "Instant publishing",
    description: "Safe posts go live in seconds — no manual review queue to wait behind.",
  },
  {
    icon: MessageCircleWarning,
    title: "Transparent, when blocked",
    description: "If a post is stopped, the reason is shown plainly — never a black box.",
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="py-20 md:py-28">
      <Container className="flex flex-col gap-14">
        <Reveal>
          <SectionHeading
            eyebrow="What you get"
            title="Everything a social feed should have — plus one thing others don't."
            description="Post, follow, like, and comment as usual. Built-in moderation is what sets the feed apart."
          />
        </Reveal>

        <Reveal stagger>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description, highlight }) => (
              <RevealItem key={title}>
                <Card
                  interactive
                  className={cn("h-full p-6", highlight && "border-accent/40 bg-accent/[0.04]")}
                >
                  <CardContent className="flex h-full flex-col gap-3 p-0">
                    <div className="flex items-center justify-between">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-md",
                          highlight ? "bg-accent/15" : "bg-surface-2"
                        )}
                      >
                        <Icon size={17} className="text-accent" aria-hidden="true" />
                      </div>
                      {highlight && <Badge variant="accent">Unique to SmartMeme</Badge>}
                    </div>
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
