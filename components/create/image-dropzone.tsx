"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, ImagePlus, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/motion";

interface ImageDropzoneProps {
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
}

export function ImageDropzone({ previewUrl, onFileSelected, onRemove }: ImageDropzoneProps) {
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function openPicker() {
    inputRef.current?.click();
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg sm:aspect-square">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      <AnimatePresence mode="wait" initial={false}>
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.entrance}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Selected post preview" className="h-full w-full object-cover" />

            <div className="absolute right-3 top-3 flex gap-2">
              <button
                type="button"
                aria-label="Replace image"
                onClick={openPicker}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:bg-background/90"
              >
                <RefreshCw size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Remove image"
                onClick={onRemove}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:bg-blocked/80 hover:text-blocked-foreground"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            role="button"
            tabIndex={0}
            aria-label="Upload an image, or drag and drop a file here"
            onClick={openPicker}
            onKeyDown={handleKeyDown}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: dragOver ? 1.01 : 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.spring}
            className={cn(
              "absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 text-center outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              dragOver ? "border-accent bg-accent/5" : "border-border bg-surface-1"
            )}
          >
            {dragOver ? (
              <UploadCloud size={28} className="text-accent" aria-hidden="true" />
            ) : (
              <ImagePlus size={28} className="text-muted-foreground" aria-hidden="true" />
            )}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                {dragOver ? "Drop to upload" : "Drag a photo here"}
              </span>
              {!dragOver && (
                <span className="text-xs text-muted-foreground">or click to browse</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
