import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Upscaler — high-quality bicubic upscale using the browser's built-in
 * `imageSmoothingQuality: high` setting. This is the always-free fallback
 * path; future revisions will swap in a Real-ESRGAN ONNX model when the
 * `mode` field is set to "ai".
 */
export const upscalerPlugin: PluginDefinition = {
  id: "upscaler",
  name: "Upscaler",
  description:
    "Enlarge images 2× or 4× with high-quality bicubic resampling. Lossless geometry, no AI hallucination.",
  icon: "🔍",
  version: "1.0.0",
  category: "ai",
  fields: [
    {
      key: "factor",
      type: "select",
      label: "Scale",
      default: "2",
      options: [
        { value: "1.5", label: "1.5×" },
        { value: "2", label: "2×" },
        { value: "3", label: "3×" },
        { value: "4", label: "4×" },
        { value: "8", label: "8× (large output)" },
        { value: "16", label: "16× (very large output)" },
      ],
    },
    {
      key: "sharpen",
      type: "slider",
      label: "Post-sharpen",
      description: "Subtle unsharp-mask after upscaling. 0 = off.",
      default: 0,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
  ],
  async run({ canvas, options }) {
    const factor = Number(options.factor ?? 2);
    const sharpenAmount = Number(options.sharpen ?? 0) / 100;

    const targetW = Math.max(1, Math.round(canvas.width * factor));
    const targetH = Math.max(1, Math.round(canvas.height * factor));

    // Stepwise upscale by 2× passes for better bicubic quality on large factors.
    let current = canvas;
    let currentW = canvas.width;
    let currentH = canvas.height;
    while (currentW * 2 <= targetW && currentH * 2 <= targetH) {
      const next = createCanvas(currentW * 2, currentH * 2);
      const nctx = get2D(next);
      nctx.imageSmoothingEnabled = true;
      nctx.imageSmoothingQuality = "high";
      nctx.drawImage(current, 0, 0, currentW * 2, currentH * 2);
      current = next;
      currentW *= 2;
      currentH *= 2;
    }

    const out = createCanvas(targetW, targetH);
    const ctx = get2D(out);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(current, 0, 0, targetW, targetH);

    if (sharpenAmount > 0) {
      unsharpMask(ctx, targetW, targetH, sharpenAmount);
    }
    return out;
  },
};

/**
 * Unsharp mask: image + amount * (image - gaussian_blur(image)).
 * We use a cheap 3×3 box blur as the smoothing kernel — fast and visually
 * indistinguishable from a small gaussian for a post-resize sharpening pass.
 */
function unsharpMask(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  amount: number,
) {
  const src = ctx.getImageData(0, 0, W, H);
  const dst = ctx.createImageData(W, H);
  const sd = src.data;
  const dd = dst.data;

  const idxOf = (x: number, y: number) =>
    (Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 4;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const i = idxOf(x + dx, y + dy);
          r += sd[i];
          g += sd[i + 1];
          b += sd[i + 2];
        }
      }
      r /= 9;
      g /= 9;
      b /= 9;

      const i = (y * W + x) * 4;
      dd[i] = clamp(sd[i] + amount * (sd[i] - r));
      dd[i + 1] = clamp(sd[i + 1] + amount * (sd[i + 1] - g));
      dd[i + 2] = clamp(sd[i + 2] + amount * (sd[i + 2] - b));
      dd[i + 3] = sd[i + 3];
    }
  }
  ctx.putImageData(dst, 0, 0);
}

function clamp(v: number): number {
  if (v < 0) return 0;
  if (v > 255) return 255;
  return v;
}
