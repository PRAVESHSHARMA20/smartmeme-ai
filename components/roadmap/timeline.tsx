import { Reveal } from "@/components/reveal";
import { MilestoneCard } from "@/components/roadmap/milestone-card";
import { MILESTONES } from "@/lib/roadmap-config";

export function RoadmapTimeline() {
  return (
    <div className="mx-auto max-w-2xl">
      <Reveal stagger>
        <div className="relative">
          <div aria-hidden="true" className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <ol className="flex flex-col gap-5">
            {MILESTONES.map((milestone) => (
              <MilestoneCard key={milestone.phase} milestone={milestone} />
            ))}
          </ol>
        </div>
      </Reveal>
    </div>
  );
}
