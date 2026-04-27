import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata = {
  title: "PixlForge — Terms of Service",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
          <div className="prose prose-sm mt-8 dark:prose-invert max-w-none space-y-4 text-muted-foreground">
            <p>
              By using PixlForge, you agree to these terms.
            </p>
            <h2 className="text-lg font-semibold text-foreground">Service</h2>
            <p>
              PixlForge provides free, browser-based image editing tools. All processing runs locally in your browser.
            </p>
            <h2 className="text-lg font-semibold text-foreground">Your Content</h2>
            <p>
              You retain full ownership of all images you process with PixlForge. We do not claim any rights to your content.
            </p>
            <h2 className="text-lg font-semibold text-foreground">Disclaimer</h2>
            <p>
              PixlForge is provided &quot;as is&quot; without warranty. We are not liable for any damages arising from use of the service.
            </p>
            <h2 className="text-lg font-semibold text-foreground">License</h2>
            <p>
              PixlForge is open-source software released under the MIT License.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
