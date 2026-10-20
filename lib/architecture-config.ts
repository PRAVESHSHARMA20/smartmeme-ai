export interface PipelineStage {
  title: string;
  short: string;
  detail: string;
  subitems?: string[];
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    title: "User upload",
    short: "You select an image or meme to post.",
    detail: "The file and caption enter the pipeline before anything is published.",
  },
  {
    title: "Image preprocessing",
    short: "The image is normalized for analysis.",
    detail: "Resizing, format checks, and cleanup prepare it for every model downstream.",
  },
  {
    title: "OCR (extract text)",
    short: "Any text baked into the image is read.",
    detail: "Captions, overlays, and embedded text are extracted for language analysis.",
  },
  {
    title: "Image understanding",
    short: "A vision model interprets the picture itself.",
    detail: "Objects, scenes, and visual context are identified beyond just the pixels.",
  },
  {
    title: "Text understanding",
    short: "Extracted and captioned text is parsed.",
    detail: "Language, tone, and phrasing are understood on their own terms.",
  },
  {
    title: "Context & sentiment analysis",
    short: "Image and text are combined for overall meaning.",
    detail: "Humor, sarcasm, and genuine hostility read very differently in context.",
  },
  {
    title: "Safety checks",
    short: "Five checks run against the combined understanding.",
    detail: "Each check runs independently, then feeds into a single combined signal.",
    subitems: ["Hate speech", "Cyberbullying", "Harassment", "Violence", "Threat detection"],
  },
  {
    title: "AI decision engine",
    short: "All signals are combined into one verdict.",
    detail: "A single pass/fail decision is generated from every check above.",
  },
];
