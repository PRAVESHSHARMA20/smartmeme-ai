"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedBottomNav() {
  const pathname = usePathname();
  const homeActive = pathname === "/feed";

  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/60 lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-6">
        <Link
          href="/feed"
          aria-label="Home"
          aria-current={homeActive ? "page" : undefined}
          className={cn("flex flex-col items-center gap-0.5", homeActive ? "text-accent" : "text-muted-foreground")}
        >
          <Home size={22} aria-hidden="true" />
        </Link>

        <span aria-disabled="true" className="flex flex-col items-center gap-0.5 text-muted-foreground/50">
          <Compass size={22} aria-hidden="true" />
        </span>

        <Link
          href="/create"
          aria-label="Create post"
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground",
            "transition-transform hover:scale-105 active:scale-95"
          )}
        >
          <PlusCircle size={22} aria-hidden="true" />
        </Link>

        <span aria-disabled="true" className="flex flex-col items-center gap-0.5 text-muted-foreground/50">
          <CircleUserRound size={22} aria-hidden="true" />
        </span>
      </div>
    </nav>
  );
}
