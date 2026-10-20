import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Moderation flow", href: "#moderation-flow" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Architecture", href: "/architecture" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-10 py-14 md:flex-row md:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck size={18} className="text-accent" aria-hidden="true" />
            SmartMeme AI
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            A social feed for sharing memes and moments with people you
            follow — protected by AI moderation built into every post.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:gap-16">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <span className="text-sm font-medium text-foreground">{col.heading}</span>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} SmartMeme AI. University project prototype.</p>
        <p>Built for demonstration purposes.</p>
      </Container>
    </footer>
  );
}
