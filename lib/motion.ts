import type { Transition, Variants } from "framer-motion";

/**
 * Motion system, following Emil Kowalski's approach: motion communicates
 * state, not decoration. Two families only —
 *  - EASE:   for entrances/exits driven by time (page transitions, reveals)
 *  - SPRING: for anything driven by user interaction (hover, press, drag)
 * Global reduced-motion handling lives in <MotionConfig reducedMotion="user">
 * in app/layout.tsx, so individual components do not need to check it.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const transitions = {
  entrance: {
    duration: 0.5,
    ease: EASE_OUT_EXPO,
  } satisfies Transition,
  exit: {
    duration: 0.3,
    ease: EASE_OUT_EXPO,
  } satisfies Transition,
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } satisfies Transition,
  springSnappy: {
    type: "spring",
    stiffness: 420,
    damping: 28,
  } satisfies Transition,
};

/** Content fading up into place — the default entrance for cards, sections. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transitions.entrance },
};

/** Simple opacity-only entrance, for elements where vertical motion would be noise. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.entrance },
};

/** Stagger wrapper for lists/grids of cards (feed, checklist items, etc). */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/** Interactive press feedback for buttons and clickable cards. */
export const pressable = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.985 },
  transition: transitions.spring,
};
