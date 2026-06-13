import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Trim — removes transparent (or near-transparent) padding around an image
 * by computing the bounding box of opaque pixels and cropping.
 */
export const trimPlugin: PluginDefinition = {
  id: "trim",
  name: "Trim",
  description: "Remove transparent padding around the image.",
  icon: "✂️",
  version: "1.0.0",
  category: "geometry",
  fields: [
    {
      key: "alphaThreshold",
      type: "slider",
      label: "Alpha threshold",
      description:
        "Pixels with alpha at or below this are treated as transparent.",
      default: 0,
      min: 0,
      max: 255,
      step: 1,
    },
  ],
  async run({ canvas, options }) {
    const alphaThreshold = Number(options.alphaThreshold ?? 0);
    const ctx = get2D(canvas);
    const { width: W, height: H } = canvas;
    const data = ctx.getImageData(0, 0, W, H).data;

    let top = H;
    let left = W;
    let right = -1;
    let bottom = -1;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const a = data[(y * W + x) * 4 + 3];
        if (a > alphaThreshold) {
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }
    }

    if (right < 0 || bottom < 0) {
      // Fully transparent — keep a 1x1 canvas to avoid 0-sized errors.
      return createCanvas(1, 1);
    }

    const newW = right - left + 1;
    const newH = bottom - top + 1;
    const out = createCanvas(newW, newH);
    get2D(out).drawImage(canvas, -left, -top);
    return out;
  },
};
