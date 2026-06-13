import { canvasToBlob, createCanvas, urlToCanvas } from "./canvas";
import { getPlugin } from "../plugins/registry";
import type { PipelineStep } from "../plugins/types";
import type { ExportFormat } from "../store";

/**
 * Run the configured pipeline on a single source URL and return a Blob in
 * the requested export format. The first step receives the original image
 * canvas; each subsequent step gets the canvas returned by the previous one.
 */
export async function runPipeline(
  sourceUrl: string,
  pipeline: PipelineStep[],
  format: ExportFormat,
  quality: number,
): Promise<Blob> {
  let canvas = await urlToCanvas(sourceUrl);

  for (const step of pipeline) {
    if (!step.enabled) continue;
    const plugin = getPlugin(step.pluginId);
    if (!plugin) continue;
    canvas = await plugin.run({
      canvas,
      options: step.options,
      ctx: { createCanvas },
    });
  }

  return canvasToBlob(canvas, format, quality);
}
