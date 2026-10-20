"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Dark mode is the product's default identity (per design brief); light mode
 * is a deliberate opt-in, not a system-preference fallback. Theme is applied
 * via a class ("dark" | "light") on <html> so Tailwind's darkMode:"class"
 * and our CSS variables in globals.css both key off the same source of truth.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={["dark", "light"]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
