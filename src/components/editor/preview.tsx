"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useEditorStore } from "@/lib/store";

type ViewMode = "after" | "before" | "split";

export function Preview() {
  const images = useEditorStore((s) => s.images);
  const selectedImageId = useEditorStore((s) => s.selectedImageId);
  const selected = images.find((i) => i.id === selectedImageId) ?? null;
  const [view, setView] = useState<ViewMode>("after");
  const [lastId, setLastId] = useState<string | null>(selectedImageId);
  const [outDims, setOutDims] = useState<{
    src: string;
    w: number;
    h: number;
  } | null>(null);
  const processedSrc = selected?.processedSrc ?? null;
  const [lastProcessedSrc, setLastProcessedSrc] = useState<string | null>(
    processedSrc,
  );
  if (lastId !== selectedImageId) {
    setLastId(selectedImageId);
    setView("after");
  }
  if (lastProcessedSrc !== processedSrc) {
    setLastProcessedSrc(processedSrc);
    if (outDims && outDims.src !== processedSrc) setOutDims(null);
  }

  useEffect(() => {
    if (!processedSrc) return;
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) {
        setOutDims({
          src: processedSrc,
          w: img.naturalWidth,
          h: img.naturalHeight,
        });
      }
    };
    img.src = processedSrc;
    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [processedSrc]);

  if (!selected) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
        Add an image to start previewing your pipeline.
      </div>
    );
  }

  const showAfter = view !== "before";
  const showBefore = view !== "after";

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{selected.name}</span>{" "}
          · {selected.width}×{selected.height}
          {outDims &&
            outDims.src === processedSrc &&
            (outDims.w !== selected.width || outDims.h !== selected.height) && (
              <span className="ml-1 font-medium text-foreground">
                → {outDims.w}×{outDims.h}
              </span>
            )}
        </div>
        <div className="inline-flex rounded-md border bg-muted/40 p-0.5 text-xs">
          {(["before", "split", "after"] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setView(m)}
              className={`rounded px-2.5 py-1 capitalize transition-colors ${
                view === m
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl border bg-checker">
        {showBefore && (
          <div
            className={`relative flex h-full w-full items-center justify-center ${
              view === "split" ? "border-r" : ""
            }`}
            style={view === "split" ? { width: "50%" } : undefined}
          >
            <Image
              src={selected.src}
              alt={`${selected.name} (before)`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain"
              unoptimized
            />
            {view === "split" && (
              <span className="pointer-events-none absolute left-2 top-2 rounded bg-background/80 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
                Before
              </span>
            )}
          </div>
        )}

        {showAfter && (
          <div
            className="relative flex h-full w-full items-center justify-center"
            style={view === "split" ? { width: "50%" } : undefined}
          >
            {selected.processedSrc ? (
              <Image
                src={selected.processedSrc}
                alt={`${selected.name} (processed)`}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain"
                unoptimized
              />
            ) : selected.status === "processing" ? (
              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                Processing…
              </div>
            ) : selected.status === "error" ? (
              <div className="text-sm text-destructive">
                Pipeline failed: {selected.errorMessage}
              </div>
            ) : (
              <Image
                src={selected.src}
                alt={selected.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain"
                unoptimized
              />
            )}
            {view === "split" && (
              <span className="pointer-events-none absolute right-2 top-2 rounded bg-background/80 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">
                After
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
