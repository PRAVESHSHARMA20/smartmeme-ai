"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { useClickOutside } from "@/lib/use-click-outside";
import { transitions } from "@/lib/motion";
import { MOCK_NOTIFICATIONS } from "@/lib/mock-data";

export function NotificationsMenu() {
  const [open, setOpen] = React.useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-surface-2"
      >
        <Bell size={18} aria-hidden="true" />
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={transitions.spring}
            className="absolute right-0 top-11 z-40 w-72 rounded-lg border border-border bg-surface-1 p-2 shadow-lg"
          >
            <span className="block px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Notifications
            </span>
            <ul className="flex flex-col">
              {MOCK_NOTIFICATIONS.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 rounded-md px-2 py-2 text-left text-sm hover:bg-surface-2"
                  >
                    <span className="text-foreground">{n.text}</span>
                    <span className="text-xs text-muted-foreground">{n.timeAgo} ago</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
