"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Site-wide back control. Uses browser history when available and falls
 * back to the feed or homepage when a page is opened directly.
 */
export function GlobalBackButton() {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/feed");
  }

  return (
    <div className="pointer-events-none fixed left-3 top-20 z-40 sm:left-5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={goBack}
        aria-label="Go back to the previous page"
        className="pointer-events-auto gap-2 rounded-full border-border/70 bg-background/90 shadow-sm backdrop-blur-md"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Back</span>
      </Button>
    </div>
  );
}
