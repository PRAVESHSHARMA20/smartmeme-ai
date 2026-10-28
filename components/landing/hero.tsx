"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { SocialPostPreviewCard } from "@/components/landing/social-post-preview-card";
import { fadeUp, staggerContainer, transitions } from "@/lib/motion";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-20 md:pt-44 md:pb-28">
      {/* Soft pink gradient wash and blurred color shapes, kept behind the content. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[18%] top-[-170px] h-[540px] w-[760px] rounded-full bg-rose-200/65 blur-[125px]" />
        <div className="absolute right-[4%] top-[90px] h-[360px] w-[430px] rounded-full bg-pink-100/80 blur-[105px]" />
        <div className="absolute bottom-[-190px] left-[42%] h-[380px] w-[520px] rounded-full bg-orange-100/70 blur-[120px]" />
      </div>

      <Container className="relative grid gap-14 md:grid-cols-2 md:items-center md:gap-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-start gap-6 text-left"
        >
          <motion.span
            variants={fadeUp}
            className="rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            A social feed built for sharing memes
          </motion.span>

          <motion.h1 variants={fadeUp} className="text-display max-w-xl">
            Share memes. Connect with people.{" "}
            <span className="text-accent">Stay protected.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="max-w-lg text-body text-muted-foreground">
            SmartMeme is a feed for posting, following, and reacting to the
            memes people you follow are sharing — with every upload checked
            for harm the instant before it goes live.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Join the feed
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.entrance, delay: 0.2 }}
        >
          <SocialPostPreviewCard />
        </motion.div>
      </Container>
    </section>
  );
}
