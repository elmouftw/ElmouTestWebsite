import Link from "next/link";
import {
  Images,
  Zap,
  Printer,
  Layers,
  Shield,
  Gift,
  Upload,
  Settings,
  Download,
  ChevronDown,
} from "lucide-react";
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
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.85_0.15_300/.35),transparent_60%)] dark:bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.45_0.2_300/.3),transparent_60%)]"
          />
          <div className="mx-auto max-w-7xl px-4 py-20 text-center md:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-fuchsia-500" />
              Free &middot; Open Source &middot; Runs locally in your browser
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
              One Click Bulk Image
              <br className="hidden md:block" /> Editing Pipeline
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
              PixlForge is a chainable image-processing studio. Stack {plugins.length}+ plugins
              like Color Removal, Resize, Filters, Watermarks and more into a
              repeatable pipeline and apply it to hundreds of images at once
              &mdash; all in your browser, with zero uploads.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/app">Start Editing Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/plugins">Browse {plugins.length} plugins</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/40 dark:bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="text-center">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Built for Creators
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Everything you need, nothing you don&apos;t
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Powerful image editing tools built for speed and simplicity. No learning curve, no subscriptions, no uploads.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Images className="size-6" />}
                title="Batch Processing"
                body="Process hundreds of images at once. Upload your entire catalog and apply edits to all images simultaneously."
                badge="100+ images at once"
              />
              <FeatureCard
                icon={<Zap className="size-6" />}
                title="Lightning Fast"
                body="Core processing happens locally in your browser for instant results. No uploads required."
              />
              <FeatureCard
                icon={<Printer className="size-6" />}
                title="Print-Ready Quality"
                body="Engineered for speed and quality. Print and digital output with proper DPI handling and smart compression."
                badge="300 DPI support"
              />
              <FeatureCard
                icon={<Layers className="size-6" />}
                title="Custom Pipelines"
                body="Chain multiple tools together in any order to create your perfect workflow. Save presets for reuse."
              />
              <FeatureCard
                icon={<Shield className="size-6" />}
                title="100% Private"
                body="All processing runs locally in your browser. Your images never leave your machine."
              />
              <FeatureCard
                icon={<Gift className="size-6" />}
                title="Completely Free"
                body="Every tool is free forever. No signups, no credit cards, no watermarks, no limits."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t">
          <div className="mx-auto max-w-5xl px-4 py-16">
            <div className="text-center">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                How It Works
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Ready in Seconds
              </h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <StepCard
                num="1"
                icon={<Upload className="size-8 text-fuchsia-500" />}
                title="Drop Your Images"
                body="Drag and drop images or click to upload. Supports PNG, JPEG, WebP, GIF, BMP, and AVIF. Batch upload your entire catalog at once."
              />
              <StepCard
                num="2"
                icon={<Settings className="size-8 text-violet-500" />}
                title="Choose Your Tools"
                body="Select and configure the tools you need. Arrange them in your preferred order to build your perfect pipeline."
              />
              <StepCard
                num="3"
                icon={<Download className="size-8 text-sky-500" />}
                title="Export &amp; Profit"
                body="Download your processed images one by one or all at once as a ZIP. Print-ready, web-ready, marketplace-ready."
              />
            </div>
          </div>
        </section>

        {/* Available Plugins */}
        <section className="border-t bg-muted/40 dark:bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <h2 className="text-2xl font-semibold tracking-tight">
              {plugins.length} Free Plugins
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Each plugin is a small, deterministic transformation. Combine them in any order to build your perfect workflow.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {plugins.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border bg-card p-4 transition-colors hover:border-foreground/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>
                      {p.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm">{p.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t">
          <div className="mx-auto max-w-3xl px-4 py-16">
            <div className="text-center">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                FAQ
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mt-10 space-y-0 divide-y">
              <FaqItem
                q="What is PixlForge?"
                a="PixlForge is a free, browser-based image editing tool built for batch workflows. Process entire catalogs at once with tools like color removal, resizing, repositioning, watermarks, and more."
              />
              <FaqItem
                q="Is PixlForge free?"
                a="Yes, every tool is completely free with no limits. No signup required, no credit card, no watermarks."
              />
              <FaqItem
                q="Are my images uploaded to your servers?"
                a="No. All processing happens 100% locally in your browser. Your images never leave your machine."
              />
              <FaqItem
                q="What image formats are supported?"
                a="PixlForge supports PNG, JPEG, WebP, GIF, BMP, and AVIF. Export is available in PNG, JPEG, and WebP."
              />
              <FaqItem
                q="How many images can I process at once?"
                a="There is no hard limit. We have tested with hundreds of images. Performance depends on your browser and available memory."
              />
              <FaqItem
                q="Does the order of tools matter?"
                a="Yes! Tools run sequentially in the order you arrange them. You can reorder, toggle, or remove any tool at any time."
              />
              <FaqItem
                q="Which browsers are supported?"
                a="PixlForge works best on Chrome, Edge, and Firefox. Safari is supported with minor limitations on large batches."
              />
              <FaqItem
                q="Can I use processed images commercially?"
                a="Yes. PixlForge applies no restrictions on the output. Your images remain yours."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-gradient-to-b from-muted/40 to-background dark:from-muted/20">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Ready to Speed Up Your Workflow?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start editing your images right now. No signup required, no credit card, completely free forever.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/app">Start Editing Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  badge?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="text-foreground">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{body}</p>
      {badge && (
        <span className="mt-3 inline-flex rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {badge}
        </span>
      )}
    </div>
  );
}

function StepCard({
  num,
  icon,
  title,
  body,
}: {
  num: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-xl border bg-card p-6 text-center">
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
        {num}
      </span>
      <div className="mt-2 flex justify-center">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group py-4">
      <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
        {q}
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-2 text-sm text-muted-foreground">{a}</p>
    </details>
  );
}
