
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { usePostDraft } from "@/components/post-draft-context";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportRow } from "@/components/result/report-row";
import { ModeratedByBadge } from "@/components/result/moderated-by-badge";
import { transitions } from "@/lib/motion";
import { supabase } from "@/lib/supabase";

const STORAGE_BUCKET = "memes";

export default function ResultSafePage() {
  const router = useRouter();

  const { draft, outcome, sentimentResult } = usePostDraft();

  const [publishing, setPublishing] = React.useState(false);
  const [publishError, setPublishError] = React.useState("");

  async function handlePublish() {
    if (publishing) return;

    if (!draft.imageFile) {
      setPublishError(
        "The original image is missing. Please upload the meme again."
      );
      return;
    }

    setPublishing(true);
    setPublishError("");

    let uploadedPath: string | null = null;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      const extension =
        draft.imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeExtension = /^[a-z0-9]+$/.test(extension)
        ? extension
        : "jpg";

      const imagePath =
        `${user.id}/${crypto.randomUUID()}.${safeExtension}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(imagePath, draft.imageFile, {
          contentType: draft.imageFile.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      uploadedPath = imagePath;

      const { error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          caption: draft.caption.trim(),
          image_path: imagePath,
        });

      if (postError) {
        throw new Error(`Could not save post: ${postError.message}`);
      }

      router.replace("/feed");
      router.refresh();
    } catch (error) {
      console.error("Could not publish post:", error);

      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error("Could not clean up uploaded image:", cleanupError);
        }
      }

      setPublishError(
        error instanceof Error
          ? error.message
          : "Could not publish your post. Please try again."
      );
    } finally {
      setPublishing(false);
    }
  }

  if (!draft.previewUrl || !sentimentResult || outcome !== "safe") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm font-medium text-foreground">
          There&apos;s no analysis result to show.
        </p>

        <p className="max-w-xs text-sm text-muted-foreground">
          Upload a meme and complete sentiment analysis first.
        </p>

        <Button asChild size="lg">
          <Link href="/create">Analyze a meme</Link>
        </Button>
      </div>
    );
  }

  const sentiment = sentimentResult.sentiment.replaceAll("_", " ");

  const confidence = Math.max(
    0,
    Math.min(100, sentimentResult.confidence * 100)
  );

  const probabilities = Object.entries(
    sentimentResult.probabilities
  );

  return (
    <div className="min-h-screen bg-background py-16">
      <Container className="flex max-w-lg flex-col items-center gap-6 text-center">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          SmartMeme AI · Sentiment analysis
        </span>

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={transitions.spring}
          className="relative"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[60px]"
          />

          <CheckCircle2
            size={56}
            className="relative text-primary"
            aria-hidden="true"
          />
        </motion.div>

        <h1
          role="status"
          aria-live="polite"
          className="text-heading"
        >
          Analysis complete
        </h1>

        <p className="text-sm text-muted-foreground">
          Predicted sentiment:{" "}
          <span className="font-semibold capitalize text-foreground">
            {sentiment}
          </span>
        </p>

        <Card elevation={1} className="w-full p-6 text-left">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">
              Model confidence
            </span>

            <span className="text-sm font-semibold">
              {confidence.toFixed(1)}%
            </span>
          </div>

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${confidence}%` }}
            />
          </div>

          <h2 className="mb-4 text-sm font-semibold">
            Class probabilities
          </h2>

          <div className="space-y-4">
            {probabilities.map(([label, value]) => {
              const percentage = Math.max(
                0,
                Math.min(100, value * 100)
              );

              return (
                <div key={label}>
                  <ReportRow
                    label={label.replaceAll("_", " ")}
                    value={`${percentage.toFixed(1)}%`}
                  />

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="w-full rounded-xl border border-amber-500/40 bg-amber-500/5 p-5 text-left">
          <h2 className="font-semibold">Safety not assessed</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {sentimentResult.message ||
              "This model predicts sentiment only. It does not verify hate speech, cyberbullying, harassment, violence, threats, or overall content safety."}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Confidence is the model&apos;s prediction score, not a guarantee
          that the prediction is correct.
        </p>

        {publishError && (
          <p role="alert" className="w-full text-left text-sm text-red-500">
            {publishError}
          </p>
        )}

        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/create">Analyze another meme</Link>
          </Button>

          <Button
            size="lg"
            onClick={handlePublish}
            disabled={publishing}
            className="sm:min-w-[160px]"
          >
            <AnimatePresence mode="wait" initial={false}>
              {publishing ? (
                <motion.span
                  key="publishing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2
                    size={16}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Publishing…
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Publish post
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>

        <ModeratedByBadge />
      </Container>
    </div>
  );
}
