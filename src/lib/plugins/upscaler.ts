import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const upscalerPlugin: PluginDefinition = {
  id: "upscaler",
  name: "Upscaler",
  description:
    "Upscale images 2x or 4x using high-quality bicubic interpolation (free, runs locally).",
  icon: "🔍",
  version: "1.0.0",
  category: "geometry",
  fields: [
    {
      key: "factor",
      type: "select",
      label: "Upscale factor",
      default: "2",
      options: [
        { value: "2", label: "2x" },
        { value: "4", label: "4x" },
      ],
    },
    {
      key: "sharpness",
      type: "slider",
      label: "Sharpness",
      description: "Post-upscale sharpening to improve clarity.",
      default: 20,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
  ],
  async run({ canvas, options }) {
    const factor = Number(options.factor ?? 2);
    const sharpness = Number(options.sharpness ?? 20) / 100;

    const newW = canvas.width * factor;
    const newH = canvas.height * factor;
    const out = createCanvas(newW, newH);
    const ctx = get2D(out);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, newW, newH);

    if (sharpness > 0) {
      const img = ctx.getImageData(0, 0, newW, newH);
      const d = img.data;
      const copy = new Uint8ClampedArray(d);
      const k = sharpness * 1.5;
      const W = newW;
      const H = newH;

      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const idx = (y * W + x) * 4;
          for (let c = 0; c < 3; c++) {
            const center = copy[idx + c];
            const sum =
              copy[((y - 1) * W + x) * 4 + c] +
              copy[((y + 1) * W + x) * 4 + c] +
              copy[(y * W + x - 1) * 4 + c] +
              copy[(y * W + x + 1) * 4 + c];
            const val = center + k * (center - sum / 4);
            d[idx + c] = Math.max(0, Math.min(255, Math.round(val)));
          }
        }
      }

      ctx.putImageData(img, 0, 0);
    }

    return out;
  },
};
