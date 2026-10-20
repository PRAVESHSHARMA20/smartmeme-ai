export type MilestoneStatus = "completed" | "planned" | "future";

export interface Milestone {
  phase: string;
  title: string;
  status: MilestoneStatus;
  description: string;
  includes: string[];
  outcome: string;
}

export const MILESTONES: Milestone[] = [
  {
    phase: "Phase 1",
    title: "Prototype",
    status: "completed",
    description: "The interactive prototype demonstrating the full product vision and user journey.",
    includes: [
      "Landing page",
      "Authentication UI",
      "Social feed",
      "Create post",
      "AI analysis simulation",
      "Result screens",
      "Architecture",
      "Responsive UI",
    ],
    outcome: "A polished, fully clickable prototype covering the entire user journey end to end.",
  },
  {
    phase: "Phase 2",
    title: "Backend development",
    status: "planned",
    description: "Replacing simulated data with a real backend and persistent storage.",
    includes: ["FastAPI backend", "PostgreSQL database", "Authentication", "REST APIs"],
    outcome: "A working backend capable of storing real users, posts, and moderation history.",
  },
  {
    phase: "Phase 3",
    title: "AI integration",
    status: "planned",
    description: "Connecting real AI models to replace the simulated analysis pipeline.",
    includes: ["OCR", "Image classification", "Text analysis", "Multimodal AI pipeline"],
    outcome:
      "Real models trained and evaluated on a meme dataset of approximately 6,992 labeled meme images.",
  },
  {
    phase: "Phase 4",
    title: "Real-time moderation",
    status: "planned",
    description: "Bringing the real AI pipeline into the live posting flow.",
    includes: ["Upload analysis", "Confidence score", "Explainable AI results", "Publish / block decision"],
    outcome: "Every upload is analyzed by real models before publishing, end to end.",
  },
  {
    phase: "Phase 5",
    title: "Deployment",
    status: "future",
    description: "Taking SmartMeme AI from a working system to a production platform.",
    includes: ["Cloud deployment", "Monitoring", "Analytics", "Continuous model updates"],
    outcome: "A live, monitored platform that keeps improving as it runs.",
  },
];

export const FUTURE_ENHANCEMENTS = [
  "Video moderation",
  "Multi-language support",
  "Community reporting",
  "Personalized moderation settings",
  "Mobile application",
];
