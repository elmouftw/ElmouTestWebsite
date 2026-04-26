import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata = {
  title: "PixlForge — Download",
};

export default function DownloadPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            Desktop builds — coming soon
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">
            PixlForge runs in your browser today.
          </h1>
          <p className="mt-3 text-balance text-muted-foreground">
            The web editor handles bulk processing entirely client-side. Native
            macOS, Windows and Linux desktop builds (with a faster local file
            system bridge and GPU-accelerated upscaling) are in progress.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/app">Open the web editor</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/plugins">Browse plugins</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
