import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/20 opacity-25 blur-[120px]"
      />

      <header className="glass relative border-b border-border/60">
        <Container className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-medium text-foreground"
            aria-label="SmartMeme AI home"
          >
            <ShieldCheck size={20} className="text-accent" aria-hidden="true" />
            SmartMeme AI
          </Link>
          <ThemeToggle />
        </Container>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-16">
        {children}
      </main>
    </div>
  );
}
