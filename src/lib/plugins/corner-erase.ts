import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const cornerErasePlugin: PluginDefinition = {
  id: "corner-erase",
  name: "Corner Erase",
  description: "Erase a corner region (useful for removing watermarks).",
  icon: "🔲",
  version: "1.0.0",
  category: "cleanup",
  fields: [
    {
      key: "corner",
      type: "select",
      label: "Corner",
      default: "bottom-right",
      options: [
        { value: "top-left", label: "Top-left" },
        { value: "top-right", label: "Top-right" },
        { value: "bottom-left", label: "Bottom-left" },
        { value: "bottom-right", label: "Bottom-right" },
      ],
    },
    {
      key: "width",
      type: "slider",
      label: "Width",
      description: "Width of the erased region as % of image.",
      default: 20,
      min: 1,
      max: 50,
      step: 1,
      unit: "%",
    },
    {
      key: "height",
      type: "slider",
      label: "Height",
      description: "Height of the erased region as % of image.",
      default: 10,
      min: 1,
      max: 50,
      step: 1,
      unit: "%",
    },
    {
      key: "feather",
      type: "slider",
      label: "Feather",
      description: "Fade the edge of the erased region.",
      default: 0,
      min: 0,
      max: 50,
      step: 1,
      unit: "px",
    },
  ],
  async run({ canvas, options }) {
    const corner = String(options.corner ?? "bottom-right");
    const widthPct = Number(options.width ?? 20) / 100;
    const heightPct = Number(options.height ?? 10) / 100;
    const feather = Number(options.feather ?? 0);

    const out = createCanvas(canvas.width, canvas.height);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const eraseW = Math.round(canvas.width * widthPct);
    const eraseH = Math.round(canvas.height * heightPct);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    const W = canvas.width;
    const H = canvas.height;

    let regionX: number;
    let regionY: number;

    switch (corner) {
      case "top-left":
        regionX = 0;
        regionY = 0;
        break;
      case "top-right":
        regionX = W - eraseW;
        regionY = 0;
        break;
      case "bottom-left":
        regionX = 0;
        regionY = H - eraseH;
        break;
      default:
        regionX = W - eraseW;
        regionY = H - eraseH;
    }

    for (let y = regionY; y < regionY + eraseH && y < H; y++) {
      for (let x = regionX; x < regionX + eraseW && x < W; x++) {
        const idx = (y * W + x) * 4;
        if (feather > 0) {
          let innerDist: number;
          switch (corner) {
            case "top-left":
              innerDist = Math.min(regionX + eraseW - 1 - x, regionY + eraseH - 1 - y);
              break;
            case "top-right":
              innerDist = Math.min(x - regionX, regionY + eraseH - 1 - y);
              break;
            case "bottom-left":
              innerDist = Math.min(regionX + eraseW - 1 - x, y - regionY);
              break;
            default:
              innerDist = Math.min(x - regionX, y - regionY);
          }
          if (innerDist < feather) {
            const t = innerDist / feather;
            d[idx + 3] = Math.round(d[idx + 3] * t);
          } else {
            d[idx + 3] = 0;
          }
        } else {
          d[idx + 3] = 0;
        }
      }
    }

    ctx.putImageData(img, 0, 0);
    return out;
  },
};
