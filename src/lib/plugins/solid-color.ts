import { createCanvas, get2D, hexToRgb } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Solid Color — replace every non-transparent pixel with a single color
 * while preserving the alpha channel. Useful for silhouettes.
 */
export const solidColorPlugin: PluginDefinition = {
  id: "solid-color",
  name: "Solid Color",
  description: "Replace all colors with a single solid color (preserves alpha).",
  icon: "🎨",
  version: "1.0.0",
  category: "color",
  fields: [
    {
      key: "color",
      type: "color",
      label: "Color",
      default: "#000000",
    },
    {
      key: "alphaThreshold",
      type: "slider",
      label: "Alpha threshold",
      description: "Pixels at or below this alpha are left untouched.",
      default: 0,
      min: 0,
      max: 255,
      step: 1,
    },
  ],
  async run({ canvas, options }) {
    const [r, g, b] = hexToRgb(String(options.color ?? "#000000"));
    const alphaThreshold = Number(options.alphaThreshold ?? 0);

    const out = createCanvas(canvas.width, canvas.height);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > alphaThreshold) {
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
      }
    }
    ctx.putImageData(img, 0, 0);
    return out;
  },
};
