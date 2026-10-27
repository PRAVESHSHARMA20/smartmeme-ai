
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Loader2,
  UserRound,
  Flag,
  X,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MemePost {
  id: string;
  user_id: string;
  caption: string | null;
  image_path: string;
  created_at: string;
}

interface Creator {
  username: string | null;
  display_name: string | null;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
}

const REPORT_REASONS = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "spam", label: "Spam or misleading promotion" },
  { value: "explicit_content", label: "Explicit or inappropriate content" },
  { value: "misinformation", label: "Potential misinformation" },
  { value: "other", label: "Other" },
] as const;

export default function MemeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params.id;

  const [post, setPost] = useState<MemePost | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [reportError, setReportError] = useState("");

  const loadComments = useCallback(async () => {
    const { data, error: commentsError } = await supabase
      .from("comments")
      .select("id, user_id, content, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Could not load comments:", commentsError.message);
      return;
    }

    const rows = data ?? [];
    const ids = [...new Set(rows.map((comment) => comment.user_id))];

    let profiles: { id: string; username: string | null }[] = [];

    if (ids.length) {
      const { data: profileRows } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", ids);

      profiles = profileRows ?? [];
    }

    const profileMap = new Map(
      profiles.map((profile) => [profile.id, profile.username])
    );

    setComments(
      rows.map((comment) => ({
        ...comment,
        username: profileMap.get(comment.user_id) || "user",
      }))
    );
  }, [postId]);

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("id, user_id, caption, image_path, created_at")
        .eq("id", postId)
        .maybeSingle();

      if (postError) throw postError;
      if (!postData) throw new Error("This meme could not be found.");

      setPost(postData);

      const { data: imageData } = supabase.storage
        .from("memes")
        .getPublicUrl(postData.image_path);

      setImageUrl(imageData.publicUrl);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", postData.user_id)
        .maybeSingle();

      setCreator(profile ?? null);

      const { count, error: likesError } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      if (likesError) throw likesError;
      setLikeCount(count ?? 0);

      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData.user?.id ?? null;
      setUserId(currentUserId);

      if (currentUserId) {
        const { data: likeRow, error: likeError } = await supabase
          .from("likes")
          .select("post_id")
          .eq("post_id", postId)
          .eq("user_id", currentUserId)
          .maybeSingle();

        if (likeError) throw likeError;
        setLiked(!!likeRow);
      } else {
        setLiked(false);
      }

      await loadComments();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load this meme."
      );
    } finally {
      setLoading(false);
    }
  }, [postId, loadComments]);

  useEffect(() => {
    if (postId) loadPost();
  }, [postId, loadPost]);

  async function toggleLike() {
    if (!userId) {
      alert("Please log in to like this meme.");
      return;
    }

    if (liked) {
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (deleteError) {
        alert(deleteError.message);
        return;
      }

      setLiked(false);
      setLikeCount((count) => Math.max(0, count - 1));
    } else {
      const { error: insertError } = await supabase.from("likes").insert({
        post_id: postId,
        user_id: userId,
      });

      if (insertError) {
        alert(insertError.message);
        return;
      }

      setLiked(true);
      setLikeCount((count) => count + 1);
    }
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId) {
      alert("Please log in to comment.");
      return;
    }

    const content = commentText.trim();
    if (!content || submitting) return;

    setSubmitting(true);

    const { error: insertError } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: userId,
      content,
    });

    if (insertError) {
      alert(insertError.message);
    } else {
      setCommentText("");
      await loadComments();
    }

    setSubmitting(false);
  }

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (reportSubmitting) return;

    setReportError("");
    setReportMessage("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      setReportError("Please log in before reporting a meme.");
      return;
    }

    if (authData.user.id === post?.user_id) {
      setReportError("You cannot report your own meme.");
      return;
    }

    setReportSubmitting(true);

    const { error: insertError } = await supabase
      .from("meme_reports")
      .insert({
        post_id: postId,
        reporter_id: authData.user.id,
        reason: reportReason,
        details: reportDetails.trim() || null,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        setReportError("You have already reported this meme.");
      } else {
        console.error("Report submission failed:", insertError);
        setReportError(
          insertError.code === "42501"
            ? "Permission denied. Check the meme_reports table policies."
            : "Could not submit your report. Please try again."
        );
      }
    } else {
      setReportMessage(
        "Report submitted. Thank you for helping keep the community safe."
      );
      setReportDetails("");
      setReportReason("spam");
      setReportOpen(false);
    }

    setReportSubmitting(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 size={20} className="animate-spin" />
        Loading meme...
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="mx-auto max-w-xl space-y-4 py-10">
        <p className="font-semibold">Unable to open this meme</p>
        <p className="text-sm text-muted-foreground">
          {error || "This meme may have been deleted."}
        </p>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-border px-4 py-2 text-sm"
        >
          Go back
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5">
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={18} />
        Back to Explore
      </Link>

      {reportMessage && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-green-600/30 bg-green-600/5 p-4 text-sm"
        >
          <ShieldCheck size={19} className="shrink-0 text-green-600" />
          <p>{reportMessage}</p>
          <button
            type="button"
            onClick={() => setReportMessage("")}
            aria-label="Dismiss message"
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <article className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-surface-2">
            <UserRound size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {creator?.display_name || creator?.username || "Community member"}
            </p>
            <p className="text-xs text-muted-foreground">
              @{creator?.username || "user"}
            </p>
          </div>

          {userId !== post.user_id && (
            <button
              type="button"
              onClick={() => {
                setReportError("");
                setReportMessage("");
                setReportOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition hover:bg-surface-2"
            >
              <Flag size={16} />
              Report
            </button>
          )}
        </div>

        <div className="relative w-full bg-black">
          <Image
            src={imageUrl}
            alt={post.caption || "Community meme"}
            width={1200}
            height={1200}
            unoptimized
            className="mx-auto h-auto max-h-[75vh] w-full object-contain"
          />
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleLike}
              aria-label={liked ? "Unlike meme" : "Like meme"}
              className={`flex items-center gap-2 transition ${
                liked ? "text-red-500" : "text-foreground"
              }`}
            >
              <Heart size={23} fill={liked ? "currentColor" : "none"} />
              <span className="text-sm">{likeCount}</span>
            </button>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle size={22} />
              <span className="text-sm">{comments.length}</span>
            </div>
          </div>

          <p className="whitespace-pre-wrap text-sm">
            {post.caption || "No caption provided."}
          </p>

          <p className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleString()}
          </p>

          <div className="border-t border-border pt-4">
            <h2 className="mb-3 font-semibold">Comments</h2>

            <form onSubmit={submitComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write a comment..."
                maxLength={1000}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />

              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post"}
              </button>
            </form>

            <div className="mt-4 space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <span className="mr-2 font-semibold">
                      @{comment.username}
                    </span>
                    <span className="whitespace-pre-wrap">
                      {comment.content}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </article>

      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setReportOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 id="report-title" className="text-lg font-bold">
                  Report this meme
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select the reason that best describes your concern.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                aria-label="Close report dialog"
                className="rounded-lg p-2 hover:bg-surface-2"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitReport} className="space-y-4">
              <fieldset className="space-y-3">
                <legend className="mb-2 text-sm font-medium">
                  Reason for reporting
                </legend>

                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className="flex cursor-pointer items-center gap-3 text-sm"
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={reason.value}
                      checked={reportReason === reason.value}
                      onChange={() => setReportReason(reason.value)}
                      className="accent-current"
                    />
                    {reason.label}
                  </label>
                ))}
              </fieldset>

              <div>
                <label
                  htmlFor="report-details"
                  className="mb-2 block text-sm font-medium"
                >
                  Additional details (optional)
                </label>
                <textarea
                  id="report-details"
                  value={reportDetails}
                  onChange={(event) => setReportDetails(event.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Explain your concern..."
                  className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-accent"
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {reportDetails.length}/1000
                </p>
              </div>

              {reportError && (
                <p role="alert" className="text-sm text-red-500">
                  {reportError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {reportSubmitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {reportSubmitting ? "Submitting..." : "Submit report"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
