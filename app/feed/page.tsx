import { FeedTopNav } from "@/components/feed/feed-top-nav";
import { FeedLeftSidebar } from "@/components/feed/feed-left-sidebar";
import { FeedRightSidebar } from "@/components/feed/feed-right-sidebar";
import { FeedBottomNav } from "@/components/feed/feed-bottom-nav";
import { FeedCreateFab } from "@/components/feed/feed-create-fab";
import { FeedContent } from "@/components/feed/feed-content";
import { Container } from "@/components/layout/container";

export default function FeedPage() {
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
