"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PostCard } from "@/components/feed/post-card";
import { Toast } from "@/components/ui/toast";
import { usePostDraft } from "@/components/post-draft-context";
import type { MockPost } from "@/lib/mock-data";
import { transitions } from "@/lib/motion";
import { supabase } from "@/lib/supabase";

type DatabasePost = {
  id: string;
  user_id: string;
  caption: string | null;
  image_path: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
};

export function FeedContent() {
  const { publishedPosts, justPublished, consumeJustPublished } = usePostDraft();

  const [toastOpen, setToastOpen] = React.useState(false);
  const [databasePosts, setDatabasePosts] = React.useState<MockPost[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const newestPublishedId = publishedPosts[0]?.id;

  React.useEffect(() => {
    if (!justPublished) return;

    setToastOpen(true);
    consumeJustPublished();
  }, [justPublished, consumeJustPublished]);

  React.useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError("");

      const { data, error: postsError } = await supabase
        .from("posts")
        .select("id, user_id, caption, image_path, created_at")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (postsError) {
        setError(postsError.message);
        setLoading(false);
        return;
      }

      const posts = (data ?? []) as DatabasePost[];
      const userIds = [...new Set(posts.map((post) => post.user_id))];

      let profiles: Profile[] = [];

      if (userIds.length > 0) {
        const { data: profileData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", userIds);

        if (!active) return;

        if (profilesError) {
          setError(profilesError.message);
          setLoading(false);
          return;
        }

        profiles = (profileData ?? []) as Profile[];
      }

      const profileMap = new Map(
        profiles.map((profile) => [profile.id, profile])
      );

      const formattedPosts: MockPost[] = posts.map((post) => {
        const profile = profileMap.get(post.user_id);

        const imageUrl = post.image_path
          ? post.image_path.startsWith("http")
            ? post.image_path
            : supabase.storage
                .from("memes")
                .getPublicUrl(post.image_path).data.publicUrl
          : "";

        return {
          id: post.id,
          displayName:
            profile?.display_name || profile?.username || "SmartMeme User",
          handle: profile?.username || "user",
          timeAgo: new Date(post.created_at).toLocaleDateString(),
          imageUrl,
          caption: post.caption ?? "",
          likeCount: 0,
          commentCount: 0,
          comments: [],
          theme: "programming",
        };
      });

      if (active) {
        setDatabasePosts(formattedPosts);
        setLoading(false);
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, []);

  const postsToShow = [...publishedPosts, ...databasePosts];

  return (
    <>
      <div className="flex flex-col gap-5">
        {loading && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Loading posts...
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-border p-3 text-sm text-blocked"
          >
            Could not load posts: {error}
          </p>
        )}

        {!loading && !error && postsToShow.length === 0 && (
          <p className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
            No posts yet. Be the first to share a meme!
          </p>
        )}

        <AnimatePresence initial={false}>
          {postsToShow.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={transitions.spring}
            >
              <PostCard
                post={post}
                isNew={post.id === newestPublishedId}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Toast
        message="Your post has been published successfully."
        open={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
}