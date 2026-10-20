"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { ImageDropzone } from "@/components/create/image-dropzone";
import { FormMessage } from "@/components/auth/form-message";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePostDraft } from "@/components/post-draft-context";

const MAX_CAPTION_LENGTH = 280;

export function CreatePostForm() {
  const router = useRouter();
  const { draft, submitDraft } = usePostDraft();
  // Resumes an in-progress draft (e.g. "Edit Post" from the Blocked result
  // screen) instead of always starting blank — re-doing work you already
  // did is the fastest way to make someone abandon a flow.
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(draft.previewUrl);
  const [fileError, setFileError] = React.useState<string | undefined>();
  const [caption, setCaption] = React.useState(draft.caption);
  const [submitting, setSubmitting] = React.useState(false);

  function handleFileSelected(selected: File) {
    if (!selected.type.startsWith("image/")) {
      setFileError("Please upload an image file (PNG, JPG, or GIF).");
      return;
    }
    setFileError(undefined);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(selected);
    });
  }

  function handleRemove() {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function handleClose() {
    router.push("/feed");
  }

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!previewUrl) return;

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    submitDraft(previewUrl, caption);
    router.push("/analyze");
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
        <h1 className="text-base font-medium text-foreground">Create post</h1>
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-foreground"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6">
        <ImageDropzone previewUrl={previewUrl} onFileSelected={handleFileSelected} onRemove={handleRemove} />

        {fileError && <FormMessage variant="error">{fileError}</FormMessage>}

        <Textarea
          label="Caption"
          placeholder="Write a caption…"
          rows={3}
          maxLength={MAX_CAPTION_LENGTH}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          hint={`${caption.length}/${MAX_CAPTION_LENGTH}`}
        />

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck size={13} className="text-safe" aria-hidden="true" />
          We&apos;ll check this for safety the instant before it&apos;s posted.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button type="button" variant="outline" size="lg" onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={!previewUrl || submitting}>
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            "Analyze & Publish"
          )}
        </Button>
      </div>
    </form>
  );
}
