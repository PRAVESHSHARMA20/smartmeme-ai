"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ShieldCheck,
  Bug,
  Cat,
  BookOpen,
  Trophy,
  Sparkles,
} from "lucide-react";
import type { MockPost, PostTheme } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

const THEME_ICON: Record<PostTheme, typeof Bug> = {
  programming: Bug,
  cat: Cat,
  student: BookOpen,
  football: Trophy,
  anime: Sparkles,
};

interface PostComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
}

export function PostCard({
  post,
  isNew = false,
}: {
  post: MockPost;
  isNew?: boolean;
}) {
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(post.likeCount ?? 0);
  const [saved, setSaved] = React.useState(false);
  const [comments, setComments] = React.useState<PostComment[]>([]);
  const [commentCount, setCommentCount] = React.useState(
    post.commentCount ?? 0
  );
  const [commentDraft, setCommentDraft] = React.useState("");
  const [showComments, setShowComments] = React.useState(false);
  const [shareMessage, setShareMessage] = React.useState("");
  const [showNewBadge, setShowNewBadge] = React.useState(isNew);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageFailed, setImageFailed] = React.useState(false);
  const [loadingInteractions, setLoadingInteractions] = React.useState(true);
  const [likeBusy, setLikeBusy] = React.useState(false);
  const [saveBusy, setSaveBusy] = React.useState(false);
  const [commentBusy, setCommentBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const commentInputRef = React.useRef<HTMLInputElement>(null);

  const ThemeIcon = post.theme ? THEME_ICON[post.theme] ?? Sparkles : Sparkles;

  React.useEffect(() => {
    if (!isNew) return;

    setShowNewBadge(true);

    const timer = window.setTimeout(() => {
      setShowNewBadge(false);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [isNew]);

  const loadInteractions = React.useCallback(async () => {
    setLoadingInteractions(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      setCurrentUserId(user?.id ?? null);

      const [
        { data: allLikes, error: likesError },
        { data: myLike, error: myLikeError },
        { data: allComments, error: commentsError },
        { data: mySavedPost, error: savedError },
      ] = await Promise.all([
        supabase
          .from("likes")
          .select("user_id")
          .eq("post_id", post.id),

        user
          ? supabase
              .from("likes")
              .select("user_id")
              .eq("post_id", post.id)
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),

        supabase
          .from("comments")
          .select("id, user_id, content, created_at")
          .eq("post_id", post.id)
          .order("created_at", { ascending: true }),

        user
          ? supabase
              .from("saved_posts")
              .select("post_id")
              .eq("post_id", post.id)
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (likesError) throw likesError;
      if (myLikeError) throw myLikeError;
      if (commentsError) throw commentsError;
      if (savedError) throw savedError;

      setLikeCount(allLikes?.length ?? 0);
      setLiked(!!myLike);
      setSaved(!!mySavedPost);

      const commentRows = allComments ?? [];
      const authorIds = [
        ...new Set(commentRows.map((comment) => comment.user_id)),
      ];

      let profileMap = new Map<string, string>();

      if (authorIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", authorIds);

        if (profileError) throw profileError;

        profileMap = new Map(
          (profiles ?? []).map((profile) => [
            profile.id,
            profile.display_name?.trim() ||
              profile.username ||
              "SmartMeme User",
          ])
        );
      }

      setComments(
        commentRows.map((comment) => ({
          ...comment,
          username: profileMap.get(comment.user_id) ?? "SmartMeme User",
        }))
      );
      setCommentCount(commentRows.length);
    } catch (err) {
      console.error("Could not load post interactions:", err);
      setError("Couldn't load likes or comments. Please refresh.");
    } finally {
      setLoadingInteractions(false);
    }
  }, [post.id]);

  React.useEffect(() => {
    void loadInteractions();
  }, [loadInteractions]);

  async function toggleLike() {
    if (!currentUserId) {
      setError("Please sign in to like posts.");
      return;
    }

    if (likeBusy) return;

    setLikeBusy(true);
    setError("");

    try {
      if (liked) {
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);

        if (deleteError) throw deleteError;

        setLiked(false);
        setLikeCount((count) => Math.max(0, count - 1));
      } else {
        const { error: insertError } = await supabase
          .from("likes")
          .insert({
            post_id: post.id,
            user_id: currentUserId,
          });

        if (insertError) throw insertError;

        setLiked(true);
        setLikeCount((count) => count + 1);
      }
    } catch (err) {
      console.error("Could not update like:", err);
      setError("Couldn't update like. Please try again.");
    } finally {
      setLikeBusy(false);
    }
  }

  function handleDoubleClick() {
    if (!liked && !likeBusy) {
      void toggleLike();
    }
  }

  async function handleAddComment(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const text = commentDraft.trim();
    if (!text || commentBusy) return;

    if (!currentUserId) {
      setError("Please sign in to comment.");
      return;
    }

    setCommentBusy(true);
    setError("");

    try {
      const { data: insertedComment, error: insertError } = await supabase
        .from("comments")
        .insert({
          user_id: currentUserId,
          post_id: post.id,
          content: text,
        })
        .select("id, user_id, content, created_at")
        .single();

      if (insertError) throw insertError;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", currentUserId)
        .maybeSingle();

      const username =
        profile?.display_name?.trim() ||
        profile?.username ||
        "SmartMeme User";

      setComments((previous) => [
        ...previous,
        { ...insertedComment, username },
      ]);
      setCommentCount((count) => count + 1);
      setCommentDraft("");
      setShowComments(true);
    } catch (err) {
      console.error("Could not add comment:", err);
      setError("Couldn't post your comment. Please try again.");
    } finally {
      setCommentBusy(false);
    }
  }

  async function toggleSaved() {
    if (!currentUserId) {
      setError("Please sign in to save posts.");
      return;
    }

    if (saveBusy) return;

    setSaveBusy(true);
    setError("");

    try {
      if (saved) {
        const { error: deleteError } = await supabase
          .from("saved_posts")
          .delete()
          .eq("user_id", currentUserId)
          .eq("post_id", post.id);

        if (deleteError) throw deleteError;
        setSaved(false);
      } else {
        const { error: insertError } = await supabase
          .from("saved_posts")
          .insert({
            user_id: currentUserId,
            post_id: post.id,
          });

        if (insertError) throw insertError;
        setSaved(true);
      }
    } catch (err) {
      console.error("Could not update saved post:", err);
      setError("Couldn't save this post. Please try again.");
    } finally {
      setSaveBusy(false);
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage("Link copied!");
    } catch {
      setShareMessage("Copy the page link from your browser.");
    }

    window.setTimeout(() => setShareMessage(""), 2000);
  }

  return (
    <motion.article
      layout
      initial={isNew ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent">
            {(post.displayName || "U").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {post.displayName || "SmartMeme User"}
              </p>

              <AnimatePresence>
                {showNewBadge && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent"
                  >
                    New
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <p className="truncate text-xs text-muted-foreground">
              @{(post.handle || "user").replace(/^@/, "")} · {post.timeAgo}
            </p>
          </div>
        </div>

        <div
          title="SmartMeme AI"
          className="flex shrink-0 items-center gap-1 text-xs text-safe"
        >
          <ShieldCheck size={16} />
          <span className="hidden sm:inline">SmartMeme AI</span>
        </div>
      </div>

      <div
        className="relative flex min-h-48 items-center justify-center overflow-hidden bg-muted"
        onDoubleClick={handleDoubleClick}
      >
        {post.imageUrl && !imageFailed ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}

            <img
              src={post.imageUrl}
              alt={post.caption || "Meme post"}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageFailed(true);
                setImageLoaded(false);
              }}
              className={`relative max-h-[600px] w-full object-contain transition-opacity duration-200 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="flex min-h-48 w-full flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
            <ThemeIcon size={48} strokeWidth={1.5} />
            <p className="text-sm">
              {imageFailed ? "Image could not be loaded" : "Meme post"}
            </p>
          </div>
        )}

        <AnimatePresence>
          {liked && (
            <motion.div
              key="liked-heart"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none absolute"
            >
              <Heart
                size={88}
                fill="currentColor"
                className="text-red-500 drop-shadow-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => void toggleLike()}
            disabled={likeBusy || loadingInteractions}
            aria-label={liked ? "Unlike post" : "Like post"}
            aria-pressed={liked}
            className={`flex items-center gap-1.5 transition-colors disabled:opacity-60 ${
              liked
                ? "text-red-500"
                : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart size={21} fill={liked ? "currentColor" : "none"} />
            <span className="text-sm">
              {loadingInteractions ? "…" : likeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowComments((previous) => !previous);
              window.setTimeout(() => commentInputRef.current?.focus(), 0);
            }}
            aria-label="Show comments"
            aria-expanded={showComments}
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <MessageCircle size={21} />
            <span className="text-sm">
              {loadingInteractions ? "…" : commentCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => void handleShare()}
            aria-label="Share post"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Send size={20} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => void toggleSaved()}
          disabled={saveBusy || loadingInteractions}
          aria-label={saved ? "Unsave post" : "Save post"}
          aria-pressed={saved}
          className={`transition-colors disabled:opacity-60 ${
            saved
              ? "text-accent"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bookmark size={21} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {shareMessage && (
        <p role="status" className="px-4 pt-2 text-xs text-muted-foreground">
          {shareMessage}
        </p>
      )}

      {error && (
        <p role="alert" className="px-4 pt-2 text-xs text-red-500">
          {error}
        </p>
      )}

      {post.caption && (
        <div className="px-4 pb-3 pt-3">
          <p className="whitespace-pre-wrap break-words text-sm text-foreground">
            <span className="mr-2 font-semibold">
              @{(post.handle || "user").replace(/^@/, "")}
            </span>
            {post.caption}
          </p>
        </div>
      )}

      <AnimatePresence initial={false}>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-3">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <span className="mr-2 font-semibold text-foreground">
                      {comment.username}
                    </span>
                    <span className="break-words text-muted-foreground">
                      {comment.content}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No comments yet. Start the conversation!
                </p>
              )}
            </div>

            <form
              onSubmit={handleAddComment}
              className="flex items-center gap-2 border-t border-border px-4 py-3"
            >
              <input
                ref={commentInputRef}
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Add a comment..."
                aria-label="Write a comment"
                maxLength={500}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                disabled={!commentDraft.trim() || commentBusy}
                className="text-sm font-semibold text-accent disabled:opacity-40"
              >
                {commentBusy ? "Posting..." : "Post"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}