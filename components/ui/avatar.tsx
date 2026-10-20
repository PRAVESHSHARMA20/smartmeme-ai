import * as React from "react";
import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-accent/15 text-accent",
  "bg-safe/15 text-safe",
  "bg-surface-2 text-foreground",
  "bg-blocked/15 text-blocked",
];

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

function hashName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return hash;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: keyof typeof SIZES;
}

function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  const palette = PALETTE[hashName(name) % PALETTE.length];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-medium",
        SIZES[size],
        palette,
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}

export { Avatar };
