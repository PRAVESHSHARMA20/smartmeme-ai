
"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOCK_TRENDING } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

interface SuggestedUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export function FeedRightSidebar() {
  const [users, setUsers] = React.useState<SuggestedUser[]>([]);
  const [followed, setFollowed] = React.useState<Set<string>>(
    () => new Set()
  );
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [busyUsers, setBusyUsers] = React.useState<Set<string>>(
    () => new Set()
  );
  const [error, setError] = React.useState("");

  const loadSidebar = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setCurrentUserId(null);
        setUsers([]);
        setFollowed(new Set());
        return;
      }

      setCurrentUserId(user.id);

      const [
        { data: profiles, error: profilesError },
        { data: follows, error: followsError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .neq("id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),

        supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id),
      ]);

      if (profilesError) throw profilesError;
      if (followsError) throw followsError;

      // Defensive filter: never suggest the currently signed-in user.
      const otherUsers = ((profiles ?? []) as SuggestedUser[]).filter(
        (profile) => profile.id !== user.id
      );

      setUsers(otherUsers);
      setFollowed(
        new Set((follows ?? []).map((follow) => follow.following_id))
      );
    } catch (err) {
      console.error("Could not load sidebar:", err);
      setError("Couldn't load suggested users. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSidebar();

    // Reload suggestions when the authenticated account changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadSidebar();
    });

    return () => subscription.unsubscribe();
  }, [loadSidebar]);

  async function toggleFollow(userId: string) {
    if (
      !currentUserId ||
      userId === currentUserId ||
      busyUsers.has(userId)
    ) {
      return;
    }

    const wasFollowing = followed.has(userId);

    setBusyUsers((previous) => new Set(previous).add(userId));
    setError("");

    try {
      if (wasFollowing) {
        const { error: deleteError } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);

        if (deleteError) throw deleteError;

        setFollowed((previous) => {
          const next = new Set(previous);
          next.delete(userId);
          return next;
        });
      } else {
        const { error: insertError } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUserId,
            following_id: userId,
          });

        if (insertError) throw insertError;

        setFollowed((previous) => new Set(previous).add(userId));
      }
    } catch (err) {
      console.error("Could not update follow:", err);
      setError("Couldn't update follow. Please try again.");
    } finally {
      setBusyUsers((previous) => {
        const next = new Set(previous);
        next.delete(userId);
        return next;
      });
    }
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-24 flex flex-col gap-4">
        <Card elevation={1} className="p-5">
          <h2 className="mb-4 text-sm font-medium text-foreground">
            Suggested for you
          </h2>

          {loading ? (
            <p className="text-xs text-muted-foreground">
              Loading users...
            </p>
          ) : users.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {currentUserId
                ? "No other users to suggest yet."
                : "Sign in to discover users."}
            </p>
          ) : (
            <ul className="flex flex-col gap-3.5">
              {users.map((suggestedUser) => {
                const isFollowed = followed.has(suggestedUser.id);
                const displayName =
                  suggestedUser.display_name?.trim() ||
                  suggestedUser.username ||
                  "SmartMeme User";

                const handle = suggestedUser.username
                  ? `@${suggestedUser.username.replace(/^@/, "")}`
                  : "@user";

                return (
                  <li
                    key={suggestedUser.id}
                    className="flex items-center gap-3"
                  >
                    <Avatar name={displayName} size="sm" />

                    <div className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-sm font-medium text-foreground">
                        {handle}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {displayName}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant={isFollowed ? "secondary" : "outline"}
                      aria-pressed={isFollowed}
                      disabled={
                        busyUsers.has(suggestedUser.id) ||
                        !currentUserId ||
                        suggestedUser.id === currentUserId
                      }
                      onClick={() => toggleFollow(suggestedUser.id)}
                    >
                      {busyUsers.has(suggestedUser.id)
                        ? "..."
                        : isFollowed
                          ? "Following"
                          : "Follow"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          {error && (
            <p role="alert" className="mt-3 text-xs text-red-500">
              {error}
            </p>
          )}
        </Card>

        <Card elevation={1} className="p-5">
          <h2 className="mb-4 text-sm font-medium text-foreground">
            Trending
          </h2>

          <ul className="flex flex-col gap-3">
            {MOCK_TRENDING.map((trend) => (
              <li key={trend.id} className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {trend.tag}
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.posts}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </aside>
  );
}
