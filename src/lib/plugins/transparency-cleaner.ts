import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Transparency Cleaner — drop pixels whose alpha is below a threshold to
 * fully transparent. Useful for cleaning up artifacts after a background
 * removal pass.
 */
export const transparencyCleanerPlugin: PluginDefinition = {
  id: "transparency-cleaner",
  name: "Transparency Cleaner",
  description:
    "Make pixels with alpha below a threshold fully transparent. Cleans soft edges left by other tools.",
  icon: "🧹",
  version: "1.0.0",
  category: "cleanup",
  fields: [
    {
      key: "threshold",
      type: "slider",
      label: "Alpha threshold",
      default: 32,
      min: 0,
      max: 254,
      step: 1,
    },
    {
      key: "snapOpaque",
      type: "checkbox",
      label: "Snap above threshold to fully opaque",
      default: false,
    },
  ],
  async run({ canvas, options }) {
    const threshold = Number(options.threshold ?? 32);
    const snap = Boolean(options.snapOpaque);

    const out = createCanvas(canvas.width, canvas.height);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 3; i < d.length; i += 4) {
      const a = d[i];
      if (a <= threshold) {
        d[i] = 0;
      } else if (snap) {
        d[i] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return out;
  },
};
