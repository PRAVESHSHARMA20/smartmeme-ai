
"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, UserRound, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfileData {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface UserPost {
  id: string;
  user_id: string;
  caption: string | null;
  image_path: string;
  created_at: string;
  image_url: string;
  likes: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [posts, setPosts] = React.useState<UserPost[]>([]);
  const [followers, setFollowers] = React.useState(0);
  const [following, setFollowing] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          if (!cancelled) {
            setProfile(null);
            setPosts([]);
            setError("Please log in to view your profile.");
          }
          return;
        }

        const [
          { data: profileData, error: profileError },
          { data: postData, error: postsError },
          { count: followerCount, error: followersError },
          { count: followingCount, error: followingError },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("posts")
            .select("id, user_id, caption, image_path, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("follows")
            .select("follower_id", { count: "exact", head: true })
            .eq("following_id", user.id),

          supabase
            .from("follows")
            .select("following_id", { count: "exact", head: true })
            .eq("follower_id", user.id),
        ]);

        if (profileError) throw profileError;
        if (postsError) throw postsError;
        if (followersError) throw followersError;
        if (followingError) throw followingError;

        const loadedPosts = postData ?? [];
        const postIds = loadedPosts.map((post) => post.id);

        let likesByPost = new Map<string, number>();

        if (postIds.length > 0) {
          const { data: likeRows, error: likesError } = await supabase
            .from("likes")
            .select("post_id")
            .in("post_id", postIds);

          if (likesError) throw likesError;

          likesByPost = new Map();

          for (const like of likeRows ?? []) {
            likesByPost.set(
              like.post_id,
              (likesByPost.get(like.post_id) ?? 0) + 1
            );
          }
        }

        const mappedPosts: UserPost[] = loadedPosts.map((post) => ({
          ...post,
          image_url: supabase.storage
            .from("memes")
            .getPublicUrl(post.image_path).data.publicUrl,
          likes: likesByPost.get(post.id) ?? 0,
        }));

        if (cancelled) return;

        setProfile(
          profileData ?? {
            id: user.id,
            username: user.email?.split("@")[0] ?? "user",
            display_name: null,
            avatar_url: null,
          }
        );

        setPosts(mappedPosts);
        setFollowers(followerCount ?? 0);
        setFollowing(followingCount ?? 0);
      } catch (err) {
        console.error("Could not load profile:", err);
        if (!cancelled) {
          setError("Couldn't load your profile. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={20} />
        Loading profile...
      </main>
    );
  }

  if (error && !profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Go to login
        </Link>
      </main>
    );
  }

  const username = profile?.username || "user";
  const displayName =
    profile?.display_name?.trim() || username || "SmartMeme User";
  const totalLikes = posts.reduce((total, post) => total + post.likes, 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <section className="rounded-xl border border-border bg-card p-5 sm:p-8">
        <div className="flex items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <UserRound size={36} />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-foreground">
              {displayName}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              @{username.replace(/^@/, "")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Member of SmartMeme AI
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
          <div>
            <p className="text-xl font-bold text-foreground">{posts.length}</p>
            <p className="text-sm text-muted-foreground">Posts</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{totalLikes}</p>
            <p className="text-sm text-muted-foreground">Likes received</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{followers}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{following}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>
      </section>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <ImageIcon size={20} className="text-accent" />
          <h2 className="text-lg font-semibold text-foreground">My posts</h2>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
            <ImageIcon
              size={36}
              className="mx-auto mb-3 text-muted-foreground"
            />
            <h3 className="font-semibold text-foreground">No posts yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your published memes will appear here.
            </p>
            <Link
              href="/create"
              className="mt-5 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
            >
              Create a post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <img
                  src={post.image_url}
                  alt={post.caption || "My meme"}
                  loading="lazy"
                  className="aspect-square w-full bg-muted object-cover"
                />
                <div className="p-3">
                  {post.caption && (
                    <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm text-foreground">
                      {post.caption}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    ♥ {post.likes} likes
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
