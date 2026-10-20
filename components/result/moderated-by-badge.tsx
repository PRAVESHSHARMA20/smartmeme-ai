import { ShieldCheck } from "lucide-react";

export function ModeratedByBadge() {
  return (
    <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
      <ShieldCheck size={13} className="text-accent" aria-hidden="true" />
      Moderated by SmartMeme AI
    </p>
  );
}
