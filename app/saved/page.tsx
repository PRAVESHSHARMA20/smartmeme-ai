
"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SavedPost {
  id: string;
  user_id: string;
  caption: string | null;
  image_path: string;
  created_at: string;
  username: string;
  display_name: string;
  image_url: string;
  saved_at: string;
}

export default function SavedPage() {
  const [posts, setPosts] = React.useState<SavedPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const loadSavedPosts = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setPosts([]);
        setError("Please log in to view your saved posts.");
        return;
      }

      const { data: savedRows, error: savedError } = await supabase
        .from("saved_posts")
        .select("post_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (savedError) throw savedError;

      if (!savedRows?.length) {
        setPosts([]);
        return;
      }

      const postIds = savedRows.map((row) => row.post_id);

      const { data: postRows, error: postsError } = await supabase
        .from("posts")
        .select("id, user_id, caption, image_path, created_at")
        .in("id", postIds);

      if (postsError) throw postsError;

      const authorIds = [
        ...new Set((postRows ?? []).map((post) => post.user_id)),
      ];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", authorIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(
        (profiles ?? []).map((profile) => [
          profile.id,
          {
            username: profile.username || "user",
            display_name:
              profile.display_name || profile.username || "SmartMeme User",
          },
        ])
      );

      const savedTimeMap = new Map(
        savedRows.map((row) => [row.post_id, row.created_at])
      );

      const orderedPosts = (postRows ?? [])
        .map((post) => {
          const profile = profileMap.get(post.user_id);

          return {
            ...post,
            username: profile?.username || "user",
            display_name: profile?.display_name || "SmartMeme User",
            image_url: supabase.storage
              .from("memes")
              .getPublicUrl(post.image_path).data.publicUrl,
            saved_at: savedTimeMap.get(post.id) || "",
          };
        })
        .sort(
          (a, b) =>
            new Date(b.saved_at).getTime() -
            new Date(a.saved_at).getTime()
        );

      setPosts(orderedPosts);
    } catch (err) {
      console.error("Could not load saved posts:", err);
      setError("Couldn't load saved posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSavedPosts();
  }, [loadSavedPosts]);

  async function removeSavedPost(postId: string) {
    setRemovingId(postId);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please log in again.");

      const { error: deleteError } = await supabase
        .from("saved_posts")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", postId);

      if (deleteError) throw deleteError;

      setPosts((previous) => previous.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Could not remove saved post:", err);
      setError("Couldn't remove this bookmark. Please try again.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center gap-3">
        <Bookmark size={26} className="text-accent" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved Posts</h1>
          <p className="text-sm text-muted-foreground">
            Your bookmarked memes, all in one place.
          </p>
        </div>
      </header>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-300 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="animate-spin" size={20} />
          Loading saved posts...
        </div>
      ) : posts.length === 0 && !error ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <Bookmark size={42} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Nothing saved yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bookmark a meme in your feed and it will appear here.
          </p>
          <Link
            href="/feed"
            className="mt-5 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Explore the feed
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {post.display_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{post.username.replace(/^@/, "")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void removeSavedPost(post.id)}
                  disabled={removingId === post.id}
                  aria-label="Remove saved post"
                  title="Remove bookmark"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-red-500 disabled:opacity-50"
                >
                  {removingId === post.id ? (
                    <Loader2 size={19} className="animate-spin" />
                  ) : (
                    <Trash2 size={19} />
                  )}
                </button>
              </div>

              <img
                src={post.image_url}
                alt={post.caption || "Saved meme"}
                loading="lazy"
                className="max-h-[420px] w-full bg-muted object-contain"
              />

              {post.caption && (
                <p className="whitespace-pre-wrap break-words p-3 text-sm text-foreground">
                  {post.caption}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
