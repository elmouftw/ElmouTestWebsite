import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden
            className="inline-block size-6 rounded-md bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500"
          />
          <span>PixlForge</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/app" className="hover:text-foreground">
            Editor
          </Link>
          <Link href="/plugins" className="hover:text-foreground">
            Plugins
          </Link>
          <Link href="/download" className="hover:text-foreground">
            Download
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link href="/plugins">Plugins</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/app">Open Editor</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
