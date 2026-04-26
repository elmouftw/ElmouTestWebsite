import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { listPlugins } from "@/lib/plugins/registry";

export const metadata = {
  title: "PixlForge — Plugins",
};

export default function PluginsPage() {
  const plugins = listPlugins();

  const byCategory = plugins.reduce<Record<string, typeof plugins>>(
    (acc, p) => {
      (acc[p.category] ??= []).push(p);
      return acc;
    },
    {},
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Plugin gallery
              </h1>
              <p className="mt-1 max-w-xl text-muted-foreground">
                Every operation in PixlForge is a self-contained plugin. Pick
                any combination and they will run in the order you arrange
                them.
              </p>
            </div>
            <Button asChild>
              <Link href="/app">Open editor</Link>
            </Button>
          </div>

          {Object.entries(byCategory).map(([cat, list]) => (
            <section key={cat} className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {cat}
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border bg-card p-5"
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
                    {p.fields.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                        {p.fields.map((f) => (
                          <li
                            key={f.key}
                            className="rounded-full border bg-muted/50 px-2 py-0.5"
                          >
                            {f.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
