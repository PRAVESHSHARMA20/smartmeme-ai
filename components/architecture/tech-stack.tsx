import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal, RevealItem } from "@/components/reveal";

const STACK = [
  { title: "Frontend", planned: false, items: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "shadcn/ui"] },
  { title: "Backend", planned: true, items: ["FastAPI", "PostgreSQL"] },
  {
    title: "AI pipeline",
    planned: true,
    items: ["OCR engine", "Vision model", "NLP model", "Multimodal fusion", "Moderation engine"],
  },
];

export function TechStack() {
  return (
    <div className="flex flex-col gap-10">
      <Reveal>
        <SectionHeading eyebrow="Under the hood" title="Technology stack" />
      </Reveal>

      <Reveal stagger>
        <div className="grid gap-4 md:grid-cols-3">
          {STACK.map((group) => (
            <RevealItem key={group.title}>
              <Card elevation={1} className="h-full">
                <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{group.title}</CardTitle>
                  {group.planned && <Badge variant="outline">Planned implementation</Badge>}
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="flex flex-col gap-2">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </RevealItem>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
