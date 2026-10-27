
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { FeedTopNav } from "@/components/feed/feed-top-nav";
import { FeedLeftSidebar } from "@/components/feed/feed-left-sidebar";
import { FeedRightSidebar } from "@/components/feed/feed-right-sidebar";
import { FeedBottomNav } from "@/components/feed/feed-bottom-nav";
import { FeedCreateFab } from "@/components/feed/feed-create-fab";
import { FeedContent } from "@/components/feed/feed-content";
import { Container } from "@/components/layout/container";

export default function FeedPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setChecking(false);
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Checking your login...
      </main>
    );
  }

  return (
    <>
      <FeedTopNav />

      <Container className="pb-24 pt-24 lg:pb-16">
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
          <FeedLeftSidebar />

          <main aria-label="Feed" className="mx-auto w-full max-w-xl">
            <FeedContent />
          </main>

          <FeedRightSidebar />
        </div>
      </Container>

      <FeedBottomNav />
      <FeedCreateFab />
    </>
  );
}
