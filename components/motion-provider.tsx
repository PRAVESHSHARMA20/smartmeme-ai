"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

/**
 * Sets reduced-motion handling once, globally. reducedMotion="user" makes
 * every Framer Motion animation in the app automatically honor the OS-level
 * prefers-reduced-motion setting — individual components never need to
 * check for it themselves.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
