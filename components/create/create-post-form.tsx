
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X, ShieldCheck } from "lucide-react";
import { ImageDropzone } from "@/components/create/image-dropzone";
import { FormMessage } from "@/components/auth/form-message";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { usePostDraft } from "@/components/post-draft-context";

const MAX_CAPTION_LENGTH = 280;

export function CreatePostForm() {
  const router = useRouter();
  const { draft, submitDraft } = usePostDraft();

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    draft.previewUrl
  );
  const [selectedFile, setSelectedFile] = React.useState<File | null>(
    draft.imageFile
  );
  const [fileError, setFileError] = React.useState<string | undefined>();
  const [caption, setCaption] = React.useState(draft.caption);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileSelected(selected: File) {
    if (!selected.type.startsWith("image/")) {
      setFileError("Please upload an image file (PNG, JPG, or GIF).");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setFileError("Please select an image smaller than 10 MB.");
      return;
    }

    setFileError(undefined);
    setSelectedFile(selected);

    setPreviewUrl((previous) => {
      if (previous?.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return URL.createObjectURL(selected);
    });
  }

  function handleRemove() {
    setPreviewUrl((previous) => {
      if (previous?.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return null;
    });

    setSelectedFile(null);
    setFileError(undefined);
  }

  function handleClose() {
    router.push("/feed");
  }

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        router.push("/feed");
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    if (!selectedFile) {
      setFileError("Please select an image first.");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setFileError("Please upload a valid image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError("Please select an image smaller than 10 MB.");
      return;
    }

    setSubmitting(true);
    setFileError(undefined);

    try {
      const imagePreview =
        previewUrl || URL.createObjectURL(selectedFile);

      submitDraft(imagePreview, caption.trim(), selectedFile);
      router.push("/analyze");
    } catch (error) {
      setFileError(
        error instanceof Error
          ? error.message
          : "Could not prepare the image for analysis."
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
        <h1 className="text-base font-medium text-foreground">
          Create post
        </h1>

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
        <ImageDropzone
          previewUrl={previewUrl}
          onFileSelected={handleFileSelected}
          onRemove={handleRemove}
        />

        {fileError && (
          <FormMessage variant="error">{fileError}</FormMessage>
        )}

        <Textarea
          label="Caption"
          placeholder="Write a caption..."
          rows={3}
          maxLength={MAX_CAPTION_LENGTH}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          hint={`${caption.length}/${MAX_CAPTION_LENGTH}`}
        />

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck size={13} className="text-safe" aria-hidden="true" />
          AI sentiment analysis is available; safety has not been verified.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleClose}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          size="lg"
          disabled={!selectedFile || submitting}
        >
          {submitting ? "Preparing analysis..." : "Analyze meme"}
        </Button>
      </div>
    </form>
  );
}
