import { createCanvas, get2D, hexToRgb, colorDistSq } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const colorRemovalPlugin: PluginDefinition = {
  id: "color-removal",
  name: "Color Removal",
  description:
    "Remove background colors with tolerance and edge processing.",
  icon: "🧹",
  version: "1.0.0",
  category: "cleanup",
  fields: [
    {
      key: "color",
      type: "color",
      label: "Target color",
      default: "#ffffff",
    },
    {
      key: "tolerance",
      type: "slider",
      label: "Tolerance",
      description: "How far from the target color to still remove.",
      default: 30,
      min: 0,
      max: 255,
      step: 1,
    },
    {
      key: "edgeSoftness",
      type: "slider",
      label: "Edge softness",
      description: "Blend edges for smoother cutouts.",
      default: 0,
      min: 0,
      max: 20,
      step: 1,
    },
    {
      key: "removeAll",
      type: "checkbox",
      label: "Remove all matching pixels",
      default: true,
    },
  ],
  async run({ canvas, options }) {
    const [tr, tg, tb] = hexToRgb(String(options.color ?? "#ffffff"));
    const tolerance = Number(options.tolerance ?? 30);
    const edgeSoftness = Number(options.edgeSoftness ?? 0);
    const tolSq = tolerance * tolerance * 3;

    const out = createCanvas(canvas.width, canvas.height);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;

    for (let i = 0; i < d.length; i += 4) {
      const dist = colorDistSq(d[i], d[i + 1], d[i + 2], tr, tg, tb);
      if (dist <= tolSq) {
        if (edgeSoftness > 0) {
          const ratio = dist / tolSq;
          const softStart = 1 - edgeSoftness / 20;
          if (ratio > softStart) {
            const t = (ratio - softStart) / (1 - softStart);
            d[i + 3] = Math.round(d[i + 3] * t);
          } else {
            d[i + 3] = 0;
          }
        } else {
          d[i + 3] = 0;
        }
      }
    }

    ctx.putImageData(img, 0, 0);
    return out;
  },
};
