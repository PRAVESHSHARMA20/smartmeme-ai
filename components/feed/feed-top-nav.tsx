import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsMenu } from "@/components/feed/notifications-menu";
import { AvatarMenu } from "@/components/feed/avatar-menu";

export function FeedTopNav() {
  return (
    <header className="glass fixed inset-x-0 top-0 z-40 border-b border-border/60">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2 font-medium text-foreground" aria-label="SmartMeme AI home feed">
          <ShieldCheck size={20} className="text-accent" aria-hidden="true" />
          <span className="hidden sm:inline">SmartMeme AI</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <NotificationsMenu />
          <AvatarMenu />
        </div>
      </Container>
    </header>
  );
}
