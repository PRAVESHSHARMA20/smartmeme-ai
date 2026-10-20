import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportRowProps {
  label: string;
  value: string;
  flagged?: boolean;
}

export function ReportRow({ label, value, flagged = false }: ReportRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
      <span className="flex items-center gap-2.5 text-sm text-foreground">
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full",
            flagged ? "bg-blocked/15" : "bg-safe/15"
          )}
        >
          {flagged ? (
            <X size={11} className="text-blocked" strokeWidth={3} aria-hidden="true" />
          ) : (
            <Check size={11} className="text-safe" strokeWidth={3} aria-hidden="true" />
          )}
        </span>
        {label}
      </span>
      <span className={cn("text-sm font-medium", flagged ? "text-blocked" : "text-muted-foreground")}>
        {value}
      </span>
    </div>
  );
}
