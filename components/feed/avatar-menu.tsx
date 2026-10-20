"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useClickOutside } from "@/lib/use-click-outside";
import { transitions } from "@/lib/motion";
import { Avatar } from "@/components/ui/avatar";

export function AvatarMenu() {
  const [open, setOpen] = React.useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Your profile menu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full transition-opacity hover:opacity-80"
      >
        <Avatar name="You" size="sm" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Profile"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={transitions.spring}
            className="absolute right-0 top-11 z-40 w-48 rounded-lg border border-border bg-surface-1 p-1.5 shadow-lg"
          >
            <span className="block cursor-default select-none rounded-md px-2.5 py-2 text-sm text-muted-foreground">
              Profile{" "}
              <span className="text-xs">(coming soon)</span>
            </span>
            <Link
              href="/"
              className="block rounded-md px-2.5 py-2 text-sm text-foreground hover:bg-surface-2"
            >
              Log out
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
