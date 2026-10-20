"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ShieldCheck,
  Check,
  Bug,
  Cat,
  BookOpen,
  Trophy,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/motion";
import type { MockPost, PostTheme } from "@/lib/mock-data";

const THEME_ICON: Record<PostTheme, typeof Bug> = {
  programming: Bug,
  cat: Cat,
  student: BookOpen,
  football: Trophy,
  anime: Sparkles,
};

// Cycles through existing design tokens only — variety without introducing
// new colors outside the established palette (same approach as Avatar).
const THEME_COLOR = ["text-accent", "text-safe", "text-muted-foreground", "text-blocked"];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

export function PostCard({ post, isNew = false }: { post: MockPost; isNew?: boolean }) {
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(post.likeCount);
  const [saved, setSaved] = React.useState(false);
  const [burstId, setBurstId] = React.useState(0);
  const [showAllComments, setShowAllComments] = React.useState(false);
  const [comments, setComments] = React.useState(post.comments);
  const [commentCount, setCommentCount] = React.useState(post.commentCount);
  const [draft, setDraft] = React.useState("");
  const [shareCopied, setShareCopied] = React.useState(false);
  const [mediaLoaded, setMediaLoaded] = React.useState(false);
  // isNew starts true only for a freshly published post (passed in by the
  // feed); once mounted, the badge clears itself after a few seconds so it
  // never becomes stale on a post that's just... a post.
  const [showNewBadge, setShowNewBadge] = React.useState(isNew);
  const commentInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isNew) return;
    const timeout = setTimeout(() => setShowNewBadge(false), 4000);
    return () => clearTimeout(timeout);
  }, [isNew]);

  // Themed mock posts fake a load delay for a "content is arriving" feel;
  // real published images drive mediaLoaded from their own onLoad event.
  React.useEffect(() => {
    if (post.imageUrl) return;
    const delay = 350 + (hashString(post.id) % 400);
    const timeout = setTimeout(() => setMediaLoaded(true), delay);
    return () => clearTimeout(timeout);
  }, [post.id, post.imageUrl]);

  function toggleLike() {
    setLiked((prev) => {
      setLikeCount((count) => count + (prev ? -1 : 1));
      return !prev;
    });
  }

  function handleDoubleClickMedia() {
    if (!liked) toggleLike();
    setBurstId((id) => id + 1);
  }

  function handleShare() {
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1600);
  }

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [...prev, { id: `local-${Date.now()}`, user: "you", text }]);
    setCommentCount((count) => count + 1);
    setDraft("");
  }

  const visibleComments = showAllComments ? comments : comments.slice(0, 1);
  const ThemeIcon = THEME_ICON[post.theme ?? "programming"];
  const themeColor = THEME_COLOR[hashString(post.id) % THEME_COLOR.length];

  return (
    <Card elevation={1} hoverLift className="overflow-hidden" aria-label={`Post by ${post.displayName}`}>
      <article>
        {/* Header */}
        <div className="flex items-center gap-3 p-4">
          <Avatar name={post.displayName} size="md" />
          <div className="flex flex-1 flex-col leading-tight">
            <div className="flex flex-wrap items-center gap-x-1.5 text-sm">
              <span className="font-medium text-foreground">{post.displayName}</span>
              <span className="text-muted-foreground">@{post.handle}</span>
              <span className="text-muted-foreground" aria-hidden="true">
                ·
              </span>
              <span className="text-muted-foreground">{post.timeAgo}</span>
              <AnimatePresence>
                {showNewBadge && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transitions.spring}
                    className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent"
                  >
                    New
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="mt-0.5 flex items-center gap-1 text-xs text-safe">
              <ShieldCheck size={11} aria-hidden="true" />
              Protected by SmartMeme AI
            </span>
          </div>
        </div>

        {/* Media */}
        <div
          onDoubleClick={handleDoubleClickMedia}
          className="relative aspect-square w-full select-none overflow-hidden bg-surface-2"
        >
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 bg-surface-2 transition-opacity duration-500",
              mediaLoaded ? "animate-none opacity-0" : "animate-pulse opacity-100"
            )}
          />
          {post.imageUrl ? (
            <motion.img
              src={post.imageUrl}
              alt={`Post by ${post.displayName}`}
              onLoad={() => setMediaLoaded(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: mediaLoaded ? 1 : 0 }}
              transition={transitions.entrance}
              className="h-full w-full object-cover"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: mediaLoaded ? 1 : 0 }}
              transition={transitions.entrance}
              className="flex h-full w-full items-center justify-center"
            >
              <ThemeIcon size={40} className={themeColor} aria-hidden="true" strokeWidth={1.5} />
            </motion.div>
          )}

          <AnimatePresence>
            {burstId > 0 && (
              <motion.div
                key={burstId}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.15, 1, 1] }}
                transition={{ duration: 0.7, times: [0, 0.3, 0.6, 1] }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                aria-hidden="true"
              >
                <Heart size={72} className="fill-blocked text-blocked drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 px-2 pt-2">
          <button
            type="button"
            aria-label={liked ? "Unlike" : "Like"}
            aria-pressed={liked}
            onClick={toggleLike}
            className="flex h-9 items-center gap-1.5 rounded-md px-2 text-foreground hover:bg-surface-2"
          >
            <motion.span whileTap={{ scale: 0.85 }} transition={transitions.spring} className="flex">
              <Heart
                size={21}
                className={liked ? "fill-blocked text-blocked" : "text-foreground"}
                aria-hidden="true"
              />
            </motion.span>
            <span className="text-sm text-muted-foreground">{likeCount}</span>
          </button>

          <button
            type="button"
            aria-label="Comment"
            onClick={() => commentInputRef.current?.focus()}
            className="flex h-9 items-center gap-1.5 rounded-md px-2 text-foreground hover:bg-surface-2"
          >
            <MessageCircle size={20} aria-hidden="true" />
            <span className="text-sm text-muted-foreground">{commentCount}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="Share"
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-surface-2"
            >
              <Send size={19} aria-hidden="true" />
            </button>
            <AnimatePresence>
              {shareCopied && (
                <motion.span
                  role="status"
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transitions.spring}
                  className="absolute left-1/2 top-10 z-10 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-md border border-border bg-surface-2 px-2 py-1 text-xs text-foreground shadow-lg"
                >
                  <Check size={12} className="text-safe" aria-hidden="true" />
                  Link copied
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            aria-label={saved ? "Remove from saved" : "Save"}
            aria-pressed={saved}
            onClick={() => setSaved((v) => !v)}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-surface-2"
          >
            <motion.span whileTap={{ scale: 0.85 }} transition={transitions.spring} className="flex">
              <Bookmark size={20} className={cn(saved && "fill-foreground")} aria-hidden="true" />
            </motion.span>
          </button>
        </div>

        {/* Caption */}
        <div className="flex flex-col gap-1 px-4 pt-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{post.handle}</span> {post.caption}
          </p>
        </div>

        {/* Comments */}
        <div className="flex flex-col gap-1.5 px-4 pt-2">
          {commentCount > visibleComments.length && !showAllComments && (
            <button
              type="button"
              onClick={() => setShowAllComments(true)}
              className="text-left text-sm text-muted-foreground hover:text-foreground"
            >
              View all {commentCount} comments
            </button>
          )}
          {visibleComments.map((c) => (
            <p key={c.id} className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{c.user}</span> {c.text}
            </p>
          ))}
        </div>

        {/* Add comment */}
        <form onSubmit={handleAddComment} className="mt-3 flex items-center gap-2 border-t border-border p-3">
          <label htmlFor={`comment-${post.id}`} className="sr-only">
            Add a comment
          </label>
          <input
            id={`comment-${post.id}`}
            ref={commentInputRef}
            type="text"
            placeholder="Add a comment…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-9 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
          />
          {draft.trim() && (
            <button type="submit" className="text-sm font-medium text-accent hover:opacity-80">
              Post
            </button>
          )}
        </form>
      </article>
    </Card>
  );
}
