"use client";

import * as React from "react";
import type { MockPost } from "@/lib/mock-data";

export type PostOutcome = "safe" | "blocked";

interface PostDraft {
  previewUrl: string | null;
  caption: string;
  submittedAt: number | null;
}

interface PostDraftContextValue {
  draft: PostDraft;
  /** Called by Create Post right before navigating to /analyze. */
  submitDraft: (previewUrl: string, caption: string) => void;
  outcome: PostOutcome | null;
  blockedReason: string | null;
  /** Called once by the Analysis screen when the simulated pipeline finishes. */
  setOutcome: (outcome: PostOutcome, blockedReason?: string) => void;
  /** Locally "published" posts, newest first — merged into the feed. */
  publishedPosts: MockPost[];
  /** Called by the Safe result screen's Publish button. */
  publishPost: () => void;
  /** True for one feed visit right after a publish, to trigger the toast. */
  justPublished: boolean;
  /** Called by the feed once it has shown the toast. */
  consumeJustPublished: () => void;
  clear: () => void;
}

const EMPTY_DRAFT: PostDraft = { previewUrl: null, caption: "", submittedAt: null };

const PostDraftContext = React.createContext<PostDraftContextValue | null>(null);

export function PostDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraftState] = React.useState<PostDraft>(EMPTY_DRAFT);
  const [outcome, setOutcomeState] = React.useState<PostOutcome | null>(null);
  const [blockedReason, setBlockedReason] = React.useState<string | null>(null);
  const [publishedPosts, setPublishedPosts] = React.useState<MockPost[]>([]);
  const [justPublished, setJustPublished] = React.useState(false);

  const submitDraft = React.useCallback((previewUrl: string, caption: string) => {
    setDraftState({ previewUrl, caption, submittedAt: Date.now() });
    setOutcomeState(null);
    setBlockedReason(null);
  }, []);

  const setOutcome = React.useCallback((next: PostOutcome, reason?: string) => {
    setOutcomeState(next);
    setBlockedReason(reason ?? null);
  }, []);

  const publishPost = React.useCallback(() => {
    if (!draft.previewUrl) return;
    const newPost: MockPost = {
      id: `local-${Date.now()}`,
      displayName: "You",
      handle: "you",
      timeAgo: "Just now",
      caption: draft.caption,
      imageUrl: draft.previewUrl,
      likeCount: 0,
      commentCount: 0,
      comments: [],
    };
    setPublishedPosts((prev) => [newPost, ...prev]);
    setJustPublished(true);
    setDraftState(EMPTY_DRAFT);
    setOutcomeState(null);
    setBlockedReason(null);
  }, [draft]);

  const consumeJustPublished = React.useCallback(() => setJustPublished(false), []);

  const clear = React.useCallback(() => {
    setDraftState(EMPTY_DRAFT);
    setOutcomeState(null);
    setBlockedReason(null);
  }, []);

  const value = React.useMemo(
    () => ({
      draft,
      submitDraft,
      outcome,
      blockedReason,
      setOutcome,
      publishedPosts,
      publishPost,
      justPublished,
      consumeJustPublished,
      clear,
    }),
    [draft, submitDraft, outcome, blockedReason, setOutcome, publishedPosts, publishPost, justPublished, consumeJustPublished, clear]
  );

  return <PostDraftContext.Provider value={value}>{children}</PostDraftContext.Provider>;
}

export function usePostDraft() {
  const ctx = React.useContext(PostDraftContext);
  if (!ctx) throw new Error("usePostDraft must be used within PostDraftProvider");
  return ctx;
}
