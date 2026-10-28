"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedBottomNav() {
  const pathname = usePathname();
  const homeActive = pathname === "/feed";
  const exploreActive = pathname === "/explore";
  const profileActive = pathname === "/profile";

  const navItemClass = (active: boolean) =>
    cn(
      "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
      active ? "text-accent" : "text-muted-foreground hover:text-foreground"
    );

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
          className={navItemClass(homeActive)}
        >
          <Home size={22} aria-hidden="true" />
        </Link>

        <Link
          href="/explore"
          aria-label="Explore"
          aria-current={exploreActive ? "page" : undefined}
          className={navItemClass(exploreActive)}
        >
          <Compass size={22} aria-hidden="true" />
        </Link>

        <Link
          href="/create"
          aria-label="Create post"
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          )}
        >
          <PlusCircle size={22} aria-hidden="true" />
        </Link>

        <Link
          href="/profile"
          aria-label="Profile"
          aria-current={profileActive ? "page" : undefined}
          className={navItemClass(profileActive)}
        >
          <CircleUserRound size={22} aria-hidden="true" />
        </Link>
      </div>
    </nav>
  );
}
