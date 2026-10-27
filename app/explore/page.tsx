
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Compass,
  Loader2,
  UserRound,
  Heart,
  MessageCircle,
  TrendingUp,
  Clock3,
  Flame,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type SortMode = "latest" | "trending" | "discussed";

interface Post {
  id: string;
  user_id: string;
  caption: string | null;
  image_path: string;
  created_at: string;
  image_url: string;
  username: string;
  display_name: string;
  like_count: number;
  comment_count: number;
}

const TABS: {
  id: SortMode;
  label: string;
  icon: typeof Clock3;
}[] = [
  { id: "latest", label: "Latest", icon: Clock3 },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "discussed", label: "Most discussed", icon: MessageCircle },
];

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      setLoading(true);
      setError("");

      try {
        const { data: postRows, error: postsError } = await supabase
          .from("posts")
          .select("id, user_id, caption, image_path, created_at")
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;

        const rows = postRows ?? [];
        const userIds = [...new Set(rows.map((post) => post.user_id))];
        const postIds = rows.map((post) => post.id);

        const [profilesResult, likesResult, commentsResult] =
          await Promise.all([
            userIds.length
              ? supabase
                  .from("profiles")
                  .select("id, username, display_name")
                  .in("id", userIds)
              : Promise.resolve({ data: [], error: null }),

            postIds.length
              ? supabase.from("likes").select("post_id").in("post_id", postIds)
              : Promise.resolve({ data: [], error: null }),

            postIds.length
              ? supabase
                  .from("comments")
                  .select("post_id")
                  .in("post_id", postIds)
              : Promise.resolve({ data: [], error: null }),
          ]);

        if (profilesResult.error) {
          console.error("Profile loading error:", profilesResult.error.message);
        }

        if (likesResult.error) {
          console.error("Like counts unavailable:", likesResult.error.message);
        }

        if (commentsResult.error) {
          console.error(
            "Comment counts unavailable:",
            commentsResult.error.message
          );
        }

        const profileMap = new Map(
          (profilesResult.data ?? []).map((profile) => [
            profile.id,
            profile,
          ])
        );

        const likeCounts = new Map<string, number>();
        for (const like of likesResult.data ?? []) {
          likeCounts.set(
            like.post_id,
            (likeCounts.get(like.post_id) ?? 0) + 1
          );
        }

        const commentCounts = new Map<string, number>();
        for (const comment of commentsResult.data ?? []) {
          commentCounts.set(
            comment.post_id,
            (commentCounts.get(comment.post_id) ?? 0) + 1
          );
        }

        const formattedPosts: Post[] = rows.map((post) => {
          const profile = profileMap.get(post.user_id);
          const { data: imageData } = supabase.storage
            .from("memes")
            .getPublicUrl(post.image_path);

          return {
            ...post,
            image_url: imageData.publicUrl,
            username: profile?.username || "user",
            display_name:
              profile?.display_name || profile?.username || "User",
            like_count: likeCounts.get(post.id) ?? 0,
            comment_count: commentCounts.get(post.id) ?? 0,
          };
        });

        if (!cancelled) setPosts(formattedPosts);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matching = posts.filter(
      (post) =>
        !query ||
        (post.caption ?? "").toLowerCase().includes(query) ||
        post.username.toLowerCase().includes(query) ||
        post.display_name.toLowerCase().includes(query)
    );

    return [...matching].sort((a, b) => {
      if (sortMode === "trending") {
        const scoreA = a.like_count * 2 + a.comment_count * 3;
        const scoreB = b.like_count * 2 + b.comment_count * 3;

        return (
          scoreB - scoreA ||
          new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
      }

      if (sortMode === "discussed") {
        return (
          b.comment_count - a.comment_count ||
          b.like_count - a.like_count ||
          new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  }, [posts, search, sortMode]);

  const totalLikes = useMemo(
    () => posts.reduce((sum, post) => sum + post.like_count, 0),
    [posts]
  );

  return (
    <main className="min-h-screen space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-surface-2 p-3">
            <Compass size={24} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Explore</h1>
            <p className="text-sm text-muted-foreground">
              Discover memes and creators from the community.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={loading}
          aria-label="Refresh memes"
          className="rounded-xl border border-border p-3 transition hover:bg-surface-2 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Compass size={17} />
            <span className="text-xs">Community memes</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{posts.length}</p>
        </div>

        <div className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart size={17} />
            <span className="text-xs">Total likes</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{totalLikes}</p>
        </div>

        <div className="col-span-2 rounded-xl border border-border p-4 sm:col-span-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame size={17} />
            <span className="text-xs">Discover</span>
          </div>
          <p className="mt-2 text-sm font-semibold">
            Find your next favourite meme
          </p>
        </div>
      </section>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search captions or creators..."
          aria-label="Search memes or creators"
          className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-accent"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = sortMode === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSortMode(tab.id)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-border hover:bg-surface-2"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
          <span>Loading memes...</span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-border p-6 text-sm">
          <p className="font-medium">Could not load Explore.</p>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-4 rounded-lg border border-border px-4 py-2 hover:bg-surface-2"
          >
            Try again
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <Compass size={32} className="mx-auto text-muted-foreground" />
          <h2 className="mt-4 font-semibold">
            {search ? "No matching memes" : "No memes to explore yet"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {search
              ? "Try another caption or creator name."
              : "Published memes will appear here."}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-4 text-sm font-medium text-accent"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredPosts.length}{" "}
              {filteredPosts.length === 1 ? "meme" : "memes"}
              {search ? " found" : ""}
            </span>
            <span>
              {sortMode === "latest"
                ? "Latest first"
                : sortMode === "trending"
                  ? "Ranked by likes and comments"
                  : "Ranked by comments"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                aria-label={`View meme by ${post.display_name}`}
                className="group overflow-hidden rounded-xl border border-border bg-background transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-surface-2">
                  <Image
                    src={post.image_url}
                    alt={post.caption || "Community meme"}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />

                  {sortMode === "trending" && post.like_count > 0 && (
                    <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                      <TrendingUp size={13} />
                      Trending
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-3">
                  <p className="line-clamp-2 min-h-10 text-sm">
                    {post.caption || "Untitled meme"}
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2">
                      <UserRound
                        size={14}
                        className="text-muted-foreground"
                      />
                    </div>
                    <span className="truncate text-xs text-muted-foreground">
                      @{post.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 border-t border-border pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      {post.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      {post.comment_count}
                    </span>
                    <span className="ml-auto">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
