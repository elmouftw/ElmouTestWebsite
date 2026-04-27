import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata = {
  title: "PixlForge — Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
          <div className="prose prose-sm mt-8 dark:prose-invert max-w-none space-y-4 text-muted-foreground">
            <p>
              PixlForge is committed to protecting your privacy. This policy describes how we handle your information.
            </p>
            <h2 className="text-lg font-semibold text-foreground">Data Collection</h2>
            <p>
              PixlForge processes all images 100% locally in your browser. We do not collect, store, or transmit any of your images or personal data.
            </p>
            <h2 className="text-lg font-semibold text-foreground">Local Storage</h2>
            <p>
              We use browser localStorage to save your pipeline presets. This data never leaves your device and can be cleared at any time through your browser settings.
            </p>
            <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
            <p>
              We do not use any analytics, tracking, or advertising services.
            </p>
            <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
            <p>
              We use a single cookie to store your preferred theme (light/dark). No third-party cookies are used.
            </p>
            <h2 className="text-lg font-semibold text-foreground">Changes</h2>
            <p>
              This policy may be updated occasionally. Changes will be posted on this page.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
