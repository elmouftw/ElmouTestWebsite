import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const transparencyCleanerPlugin: PluginDefinition = {
  id: "transparency-cleaner",
  name: "Transparency Cleaner",
  description: "Find and remove semi-transparent pixels.",
  icon: "🧼",
  version: "1.0.0",
  category: "cleanup",
  fields: [
    {
      key: "minAlpha",
      type: "slider",
      label: "Min alpha threshold",
      description:
        "Pixels with alpha below this become fully transparent.",
      default: 128,
      min: 1,
      max: 254,
      step: 1,
    },
    {
      key: "makeOpaque",
      type: "checkbox",
      label: "Make surviving pixels fully opaque",
      default: false,
    },
    {
      key: "edgeClean",
      type: "slider",
      label: "Edge cleaning passes",
      description:
        "Number of erosion passes to clean jagged edges.",
      default: 0,
      min: 0,
      max: 5,
      step: 1,
    },
  ],
  async run({ canvas, options }) {
    const minAlpha = Number(options.minAlpha ?? 128);
    const makeOpaque = Boolean(options.makeOpaque);
    const edgeClean = Number(options.edgeClean ?? 0);

    const W = canvas.width;
    const H = canvas.height;
    const out = createCanvas(W, H);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;

    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < minAlpha) {
        d[i + 3] = 0;
      } else if (makeOpaque) {
        d[i + 3] = 255;
      }
    }

    for (let pass = 0; pass < edgeClean; pass++) {
      const copy = new Uint8ClampedArray(d);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;
          if (copy[idx + 3] === 0) continue;
          let transparentNeighbors = 0;
          if (y > 0 && copy[((y - 1) * W + x) * 4 + 3] === 0) transparentNeighbors++;
          if (y < H - 1 && copy[((y + 1) * W + x) * 4 + 3] === 0) transparentNeighbors++;
          if (x > 0 && copy[(y * W + x - 1) * 4 + 3] === 0) transparentNeighbors++;
          if (x < W - 1 && copy[(y * W + x + 1) * 4 + 3] === 0) transparentNeighbors++;
          if (transparentNeighbors >= 3) {
            d[idx + 3] = 0;
          }
        }
      }
    }

    ctx.putImageData(img, 0, 0);
    return out;
  },
};
