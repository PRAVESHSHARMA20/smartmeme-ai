"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart, MessageCircle, Send, Loader2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { transitions } from "@/lib/motion";

const VERIFY_DELAY_MS = 1500;

/** A sample social post for the landing-page hero. */
function WifiCatMeme() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 p-5 sm:p-7">
      <div aria-hidden="true" className="absolute -left-12 -top-10 h-40 w-40 rounded-full bg-rose-300/50 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-10 -right-8 h-44 w-44 rounded-full bg-orange-200/70 blur-3xl" />
      <div className="relative flex h-full w-full max-w-[300px] flex-col items-center justify-center rounded-2xl border border-white/70 bg-white/55 px-3 py-4 shadow-sm backdrop-blur-sm">
        <span className="mb-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">
          wifi restored
        </span>
        <svg
          role="img"
          aria-label="A happy cartoon cat celebrating the return of the Wi-Fi"
          viewBox="0 0 300 270"
          className="w-full max-w-[245px] drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="catBackdrop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffd7e3" />
              <stop offset="100%" stopColor="#ffe8c9" />
            </linearGradient>
            <linearGradient id="catFur" x1="0" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#fffaf4" />
              <stop offset="100%" stopColor="#e9d9d0" />
            </linearGradient>
          </defs>
          <rect x="12" y="8" width="276" height="252" rx="28" fill="url(#catBackdrop)" />
          <path d="M37 56 L44 42 L51 57 M242 52 L249 37 L256 53" fill="none" stroke="#f47291" strokeWidth="3" strokeLinecap="round" />
          <path d="M51 91 L48 43 Q47 33 57 40 L101 72 M249 91 L252 43 Q253 33 243 40 L199 72" fill="url(#catFur)" stroke="#b8a49b" strokeWidth="3" strokeLinejoin="round" />
          <path d="M65 79 Q150 34 235 79 Q256 96 250 154 Q241 210 150 218 Q59 210 50 154 Q44 96 65 79Z" fill="url(#catFur)" stroke="#b8a49b" strokeWidth="3" />
          <path d="M65 70 L57 46 L87 77 M235 70 L243 46 L213 77" fill="#f5a9b7" />
          <ellipse cx="111" cy="125" rx="8" ry="12" fill="#302a32" />
          <ellipse cx="189" cy="125" rx="8" ry="12" fill="#302a32" />
          <circle cx="114" cy="121" r="2.5" fill="#fff" />
          <circle cx="192" cy="121" r="2.5" fill="#fff" />
          <path d="M143 145 Q150 153 157 145 Q150 159 143 145Z" fill="#e87991" />
          <path d="M150 157 Q140 171 130 160 M150 157 Q160 171 170 160" fill="none" stroke="#6e5960" strokeWidth="3" strokeLinecap="round" />
          <path d="M86 151 L51 145 M87 162 L53 166 M214 151 L249 145 M213 162 L247 166" stroke="#b8a49b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M109 190 Q150 208 191 190" fill="none" stroke="#d4bcb1" strokeWidth="4" strokeLinecap="round" />
          <path d="M35 103 l-10 -8 M264 102 l10 -8 M38 182 l-12 5 M262 182 l12 5" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
          <path d="M126 32 q8 -12 16 0 q8 -12 16 0" fill="none" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
          <g transform="translate(205 184)">
            <circle cx="0" cy="0" r="22" fill="#fff" stroke="#fda4af" strokeWidth="2" />
            <path d="M-11 -3 Q0 -14 11 -3 M-7 3 Q0 -4 7 3 M-2 9 Q0 7 2 9" fill="none" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="14" r="2" fill="#e11d48" />
          </g>
          <text x="150" y="242" textAnchor="middle" fontSize="12" fontWeight="700" fill="#9f1239">I'M BACK ONLINE!</text>
        </svg>
      </div>
    </div>
  );
}

export function SocialPostPreviewCard() {
  const prefersReducedMotion = useReducedMotion();
  const [verified, setVerified] = React.useState(false);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setVerified(true);
      return;
    }
    const timeout = setTimeout(() => setVerified(true), VERIFY_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [prefersReducedMotion]);

  return (
    <Card elevation={2} className="mx-auto w-full max-w-sm overflow-hidden">
      {/* Keep the original social-post header and protection status. */}
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-medium text-foreground">
          M
        </div>
        <div className="flex flex-1 flex-col leading-tight">
          <span className="text-sm font-medium text-foreground">mia.creates</span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>2m</span>
            <span aria-hidden="true">·</span>
            <AnimatePresence mode="wait">
              {verified ? (
                <motion.span
                  key="verified"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={transitions.spring}
                  className="flex items-center gap-1 text-safe"
                >
                  <ShieldCheck size={12} aria-hidden="true" />
                  Protected
                </motion.span>
              ) : (
                <motion.span
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1"
                >
                  <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                  Checking
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Replace the empty placeholder with an original animal meme illustration. */}
      <div className="aspect-square w-full">
        <WifiCatMeme />
      </div>

      {/* Preserve the existing like, comment, share, likes count and caption. */}
      <div className="flex items-center gap-4 px-4 pt-3 text-foreground">
        <Heart size={20} aria-hidden="true" />
        <MessageCircle size={20} aria-hidden="true" />
        <Send size={19} aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-1 p-4 pt-2">
        <span className="text-sm font-medium text-foreground">128 likes</span>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">mia.creates</span>{" "}
          when the wifi finally comes back on 😅
        </p>
      </div>
    </Card>
  );
}
