"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Used inside app/template.tsx, which Next.js re-renders on every
 * navigation (unlike layout.tsx, which persists). Keyed on pathname so
 * each route gets a fresh, fast entrance — deliberately quick (0.22s)
 * since this fires on every single click; a page transition should never
 * be the thing that makes navigation feel slow.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
