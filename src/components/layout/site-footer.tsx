import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-8 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 md:flex-row md:items-center">
        <div>
          © {new Date().getFullYear()} PixlForge. Open-source bulk image
          processor.
        </div>
        <nav className="flex flex-wrap gap-4">
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
      </div>
    </footer>
  );
}
