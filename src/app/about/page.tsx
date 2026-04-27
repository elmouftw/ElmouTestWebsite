import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { listPlugins } from "@/lib/plugins/registry";

export default function HomePage() {
  const plugins = listPlugins();
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.85_0.15_300/.35),transparent_60%)]"
          />
          <div className="mx-auto max-w-7xl px-4 py-20 text-center md:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-fuchsia-500" />
              Free · Open Source · Runs locally in your browser
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              Multiple edits to your images,
              <br className="hidden md:block" /> in one click.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
              PixlForge is a chainable image-processing studio. Stack plugins
              like Trim, Padding, Solid Color and Image Adjustments into a
              repeatable pipeline and apply it to thousands of images at once —
              all in your browser, with zero uploads.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/">Open the editor</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/plugins">Browse plugins</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20">
          <h2 className="text-2xl font-semibold tracking-tight">
            Available plugins
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Each plugin is a small, deterministic transformation. Combine them
            in any order to build your perfect workflow.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plugins.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border bg-card p-5 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>
                      {p.icon}
                    </span>
                    <h3 className="font-semibold">{p.name}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    v{p.version}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-3">
            <Feature
              title="100% client-side"
              body="Your images never leave your machine. The whole pipeline runs in your browser using Canvas + WebAssembly."
            />
            <Feature
              title="Bulk by default"
              body="Drop in dozens of files, build the pipeline once, and export the whole batch as a zip in a single click."
            />
            <Feature
              title="Open & extensible"
              body="Plugins are plain TypeScript modules. Fork the repo and ship your own — no SDKs, no servers."
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
