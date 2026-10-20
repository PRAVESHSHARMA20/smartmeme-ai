"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOCK_SUGGESTIONS, MOCK_TRENDING } from "@/lib/mock-data";

export function FeedRightSidebar() {
  const [followed, setFollowed] = React.useState<Record<string, boolean>>({});

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 flex flex-col gap-4">
        <Card elevation={1} className="p-5">
          <h2 className="mb-4 text-sm font-medium text-foreground">Suggested for you</h2>
          <ul className="flex flex-col gap-3.5">
            {MOCK_SUGGESTIONS.map((s) => {
              const isFollowed = !!followed[s.id];
              return (
                <li key={s.id} className="flex items-center gap-3">
                  <Avatar name={s.name} size="sm" />
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-sm font-medium text-foreground">{s.handle}</span>
                    <span className="truncate text-xs text-muted-foreground">{s.mutual}</span>
                  </div>
                  <Button
                    size="sm"
                    variant={isFollowed ? "secondary" : "outline"}
                    aria-pressed={isFollowed}
                    onClick={() => setFollowed((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
                  >
                    {isFollowed ? "Following" : "Follow"}
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card elevation={1} className="p-5">
          <h2 className="mb-4 text-sm font-medium text-foreground">Trending</h2>
          <ul className="flex flex-col gap-3">
            {MOCK_TRENDING.map((t) => (
              <li key={t.id} className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{t.tag}</span>
                <span className="text-xs text-muted-foreground">{t.posts}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </aside>
  );
}
