import Link from "next/link";
import { Plus } from "lucide-react";

export function FeedCreateFab() {
  return (
    <Link
      href="/create"
      aria-label="Create a new post"
      className="group fixed bottom-8 right-8 z-30 hidden items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-accent-foreground shadow-lg transition-transform hover:scale-[1.03] active:scale-95 lg:flex"
    >
      <Plus size={18} aria-hidden="true" />
      <span className="text-sm font-medium">Create post</span>
    </Link>
  );
}
