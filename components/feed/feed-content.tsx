"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PostCard } from "@/components/feed/post-card";
import { Reveal, RevealItem } from "@/components/reveal";
import { Toast } from "@/components/ui/toast";
import { usePostDraft } from "@/components/post-draft-context";
import { MOCK_POSTS } from "@/lib/mock-data";
import { transitions } from "@/lib/motion";

export function FeedContent() {
  const { publishedPosts, justPublished, consumeJustPublished } = usePostDraft();
  const [toastOpen, setToastOpen] = React.useState(false);
  const newestPublishedId = publishedPosts[0]?.id;

  React.useEffect(() => {
    if (!justPublished) return;
    setToastOpen(true);
    consumeJustPublished();
  }, [justPublished, consumeJustPublished]);

  return (
    <>
      <div className="flex flex-col gap-5">
        <AnimatePresence initial={false}>
          {publishedPosts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={transitions.spring}
            >
              <PostCard post={post} isNew={post.id === newestPublishedId} />
            </motion.div>
          ))}
        </AnimatePresence>

        <Reveal stagger className="flex flex-col gap-5">
          {MOCK_POSTS.map((post) => (
            <RevealItem key={post.id}>
              <PostCard post={post} />
            </RevealItem>
          ))}
        </Reveal>
      </div>

      <Toast
        message="Your post has been published successfully."
        open={toastOpen}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
}
