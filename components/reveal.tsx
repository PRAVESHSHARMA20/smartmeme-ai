"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Wrap multiple children that should stagger in one after another. */
  stagger?: boolean;
}

/**
 * Every section entrance on marketing pages goes through this component —
 * one place controls "how content arrives on scroll" for the whole app.
 * Plays once (viewport.once) so re-scrolling past a section doesn't
 * re-trigger the animation, which would read as decorative rather than
 * informative.
 */
export function Reveal({ children, className, stagger = false }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger ? staggerContainer : fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Child item used inside a stagger=true Reveal (e.g. a grid of feature cards). */
export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
