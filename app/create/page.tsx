import { CreatePostForm } from "@/components/create/create-post-form";

export default function CreatePage() {
  return (
    <div className="relative flex min-h-screen items-stretch justify-center bg-background sm:items-center sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 hidden h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/15 opacity-25 blur-[120px] sm:block"
      />

      <div className="relative flex w-full flex-col bg-surface-1 sm:max-h-[85vh] sm:max-w-lg sm:rounded-lg sm:border sm:border-border sm:shadow-xl">
        <CreatePostForm />
      </div>
    </div>
  );
}
