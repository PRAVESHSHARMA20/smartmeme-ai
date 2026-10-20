import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      {eyebrow && (
        <span className="text-xs font-medium uppercase tracking-widest text-accent">
          {eyebrow}
        </span>
      )}
      <h2 className="text-heading md:text-3xl max-w-2xl">{title}</h2>
      {description && (
        <p className="max-w-xl text-body text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export { SectionHeading };
