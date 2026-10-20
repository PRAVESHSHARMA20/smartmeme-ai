export interface Stage {
  id: string;
  label: string;
  /** Which insight (if any) becomes visible the moment this stage completes. */
  revealsInsight?: "ocr" | "objects" | "language" | "emotion" | "risk";
}

// Index 0 ("Upload complete") starts pre-completed — it already happened on
// the previous screen. Durations are deliberately uneven rather than one
// flat interval, so the pipeline reads as doing variable amounts of work
// per stage instead of a metronome.
export const STAGES: Stage[] = [
  { id: "upload", label: "Upload complete" },
  { id: "scan", label: "Scanning image" },
  { id: "ocr", label: "Extracting text (OCR)", revealsInsight: "ocr" },
  { id: "image-context", label: "Understanding image context", revealsInsight: "objects" },
  { id: "meme-context", label: "Understanding meme context", revealsInsight: "language" },
  { id: "sentiment", label: "Detecting sentiment", revealsInsight: "emotion" },
  { id: "hate-speech", label: "Checking hate speech" },
  { id: "cyberbullying", label: "Checking cyberbullying" },
  { id: "harassment", label: "Checking harassment" },
  { id: "threats", label: "Checking threats" },
  { id: "violence", label: "Checking violence" },
  { id: "decision", label: "Generating decision", revealsInsight: "risk" },
];

// Duration to complete each stage AFTER "upload" (already done). 11 values.
export const STAGE_DURATIONS_MS = [260, 340, 380, 360, 400, 340, 340, 340, 360, 340, 420];

export const DECISION_PAUSE_MS = 500;
export const SAFE_REDIRECT_DELAY_MS = 1200;
export const BLOCKED_REDIRECT_DELAY_MS = 1700;

/**
 * Demo trigger, documented per the pattern already used on Login/Signup:
 * a caption containing "blocktest" (case-insensitive) deterministically
 * produces the Blocked outcome, so the flow can be demonstrated on demand.
 * Anything else is Safe.
 */
export function resolveOutcome(caption: string): { outcome: "safe" | "blocked"; reason?: string } {
  if (caption.toLowerCase().includes("blocktest")) {
    return {
      outcome: "blocked",
      reason: "Caption contains language that targets and demeans a specific person.",
    };
  }
  return { outcome: "safe" };
}
