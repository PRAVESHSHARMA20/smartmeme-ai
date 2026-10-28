import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { MotionProvider } from "@/components/motion-provider";
import { PostDraftProvider } from "@/components/post-draft-context";
import { GlobalBackButton } from "@/components/layout/global-back-button";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SmartMeme AI",
  description: "A social feed for sharing memes, protected by AI moderation built into every post.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is required by next-themes: it sets the
    // theme class on <html> before hydration to avoid a flash.
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          <MotionProvider>
            <PostDraftProvider>
              <GlobalBackButton />
              {children}
            </PostDraftProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
