
"use client";

import * as React from "react";
import type { MockPost } from "@/lib/mock-data";

export type PostOutcome = "safe" | "blocked";

export interface SentimentResult {
  task: string;
  sentiment: string;
  confidence: number;
  probabilities: Record<string, number>;
  safety_status: string;
  message: string;
}

interface PostDraft {
  previewUrl: string | null;
  imageFile: File | null;
  caption: string;
  submittedAt: number | null;
}

interface PostDraftContextValue {
  draft: PostDraft;
  submitDraft: (previewUrl: string, caption: string, imageFile: File) => void;
  outcome: PostOutcome | null;
  blockedReason: string | null;
  sentimentResult: SentimentResult | null;
  setSentimentResult: (result: SentimentResult) => void;
  setOutcome: (outcome: PostOutcome, blockedReason?: string) => void;
  publishedPosts: MockPost[];
  publishPost: () => void;
  justPublished: boolean;
  consumeJustPublished: () => void;
  clear: () => void;
}

const EMPTY_DRAFT: PostDraft = {
  previewUrl: null,
  imageFile: null,
  caption: "",
  submittedAt: null,
};

const PostDraftContext = React.createContext<PostDraftContextValue | null>(null);

export function PostDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraftState] = React.useState<PostDraft>(EMPTY_DRAFT);
  const [outcome, setOutcomeState] = React.useState<PostOutcome | null>(null);
  const [blockedReason, setBlockedReason] = React.useState<string | null>(null);
  const [sentimentResult, setSentimentResultState] =
    React.useState<SentimentResult | null>(null);
  const [publishedPosts, setPublishedPosts] = React.useState<MockPost[]>([]);
  const [justPublished, setJustPublished] = React.useState(false);

  const submitDraft = React.useCallback(
    (previewUrl: string, caption: string, imageFile: File) => {
      setDraftState({
        previewUrl,
        imageFile,
        caption,
        submittedAt: Date.now(),
      });
      setOutcomeState(null);
      setBlockedReason(null);
      setSentimentResultState(null);
    },
    []
  );

  const setOutcome = React.useCallback(
    (next: PostOutcome, reason?: string) => {
      setOutcomeState(next);
      setBlockedReason(reason ?? null);
    },
    []
  );

  const setSentimentResult = React.useCallback((result: SentimentResult) => {
    setSentimentResultState(result);
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
    setSentimentResultState(null);
  }, [draft]);

  const consumeJustPublished = React.useCallback(
    () => setJustPublished(false),
    []
  );

  const clear = React.useCallback(() => {
    setDraftState(EMPTY_DRAFT);
    setOutcomeState(null);
    setBlockedReason(null);
    setSentimentResultState(null);
  }, []);

  const value = React.useMemo(
    () => ({
      draft,
      submitDraft,
      outcome,
      blockedReason,
      sentimentResult,
      setSentimentResult,
      setOutcome,
      publishedPosts,
      publishPost,
      justPublished,
      consumeJustPublished,
      clear,
    }),
    [
      draft,
      submitDraft,
      outcome,
      blockedReason,
      sentimentResult,
      setSentimentResult,
      setOutcome,
      publishedPosts,
      publishPost,
      justPublished,
      consumeJustPublished,
      clear,
    ]
  );

  return (
    <PostDraftContext.Provider value={value}>
      {children}
    </PostDraftContext.Provider>
  );
}

export function usePostDraft() {
  const ctx = React.useContext(PostDraftContext);
  if (!ctx) throw new Error("usePostDraft must be used within PostDraftProvider");
  return ctx;
}
