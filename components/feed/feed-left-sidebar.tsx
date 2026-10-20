"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusSquare, Bookmark, CircleUserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: typeof Home;
  label: string;
  href?: string;
  soon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Home, label: "Home", href: "/feed" },
  { icon: Compass, label: "Explore", soon: true },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { icon: Bookmark, label: "Saved", soon: true },
  { icon: CircleUserRound, label: "Profile", soon: true },
];

export function FeedLeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block">
      <nav aria-label="Primary" className="sticky top-24 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = !!item.href && pathname === item.href;
          const content = (
            <>
              <item.icon size={20} aria-hidden="true" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.soon && (
                <span className="ml-auto rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  Soon
                </span>
              )}
            </>
          );

          if (item.soon || !item.href) {
            return (
              <span
                key={item.label}
                aria-disabled="true"
                className="flex cursor-default items-center gap-3 rounded-md px-3 py-2.5 text-muted-foreground/60"
              >
                {content}
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-surface-2",
                active ? "bg-surface-2 text-accent" : "text-foreground"
              )}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
