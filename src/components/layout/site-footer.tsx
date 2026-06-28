import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30 py-10 text-sm text-muted-foreground dark:bg-muted/10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
              <span
                aria-hidden
                className="inline-block size-5 rounded-md bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500"
              />
              PixlForge
            </Link>
            <p className="mt-3 max-w-xs text-xs">
              Free, open-source batch image editing tools. 100% local processing
              for speed and privacy.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/app" className="hover:text-foreground">
                  Online Editor
                </Link>
              </li>
              <li>
                <Link href="/plugins" className="hover:text-foreground">
                  Plugins
                </Link>
              </li>
              <li>
                <Link href="/download" className="hover:text-foreground">
                  Desktop App
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/plugins" className="hover:text-foreground">
                  Plugin Gallery
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
              Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 md:flex-row">
          <span className="text-xs">
            &copy; {new Date().getFullYear()} PixlForge. Open-source bulk image processor.
          </span>
          <span className="text-xs">
            Made with care for people who care about pixels.
          </span>
        </div>
      </div>
    </footer>
  );
}
