"use client";

import { useEffect, useRef } from "react";
import { runPipeline } from "@/lib/image/pipeline";
import { useEditorStore } from "@/lib/store";

/**
 * Recompute previews whenever the pipeline or images change.
 *
 * The runner uses two layers of debouncing:
 *  - A short debounce on inputs (slider drags etc.) so we don't queue work
 *    for every intermediate state.
 *  - A per-image cancellation token so an older run never overwrites a
 *    newer one.
 */
export function usePipelineRunner() {
  const images = useEditorStore((s) => s.images);
  const pipeline = useEditorStore((s) => s.pipeline);
  const exportFormat = useEditorStore((s) => s.exportFormat);
  const exportQuality = useEditorStore((s) => s.exportQuality);
  const setProcessed = useEditorStore((s) => s.setProcessed);

  // Track the latest run id per image so stale results get discarded.
  const runIds = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const handle = setTimeout(() => {
      for (const img of images) {
        const next = (runIds.current.get(img.id) ?? 0) + 1;
        runIds.current.set(img.id, next);
        const myId = next;

        setProcessed(img.id, { status: "processing", errorMessage: undefined });

        runPipeline(img.src, pipeline, exportFormat, exportQuality)
          .then((blob) => {
            if (runIds.current.get(img.id) !== myId) return;
            const url = URL.createObjectURL(blob);
            setProcessed(img.id, { processedSrc: url, status: "done" });
          })
          .catch((err: unknown) => {
            if (runIds.current.get(img.id) !== myId) return;
            const message = err instanceof Error ? err.message : "Unknown error";
            setProcessed(img.id, { status: "error", errorMessage: message });
          });
      }
    }, 120);
    return () => clearTimeout(handle);
    // We deliberately depend on the array-of-images identity and pipeline
    // object — Zustand replaces the array reference on each mutation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, pipeline, exportFormat, exportQuality]);
}
