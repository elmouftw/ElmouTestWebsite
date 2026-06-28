import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const watermarkImagePlugin: PluginDefinition = {
  id: "watermark-image",
  name: "Watermark Image",
  description:
    "Add an image watermark (logo overlay) with position, opacity, and tiling.",
  icon: "🏷️",
  version: "1.0.0",
  category: "effect",
  fields: [
    {
      key: "watermarkSrc",
      type: "file",
      label: "Watermark image",
      default: "",
      accept: "image/*",
    },
    {
      key: "opacity",
      type: "slider",
      label: "Opacity",
      default: 30,
      min: 1,
      max: 100,
      step: 1,
      unit: "%",
    },
    {
      key: "scale",
      type: "slider",
      label: "Scale",
      default: 25,
      min: 1,
      max: 200,
      step: 1,
      unit: "%",
    },
    {
      key: "position",
      type: "select",
      label: "Position",
      default: "center",
      options: [
        { value: "center", label: "Center" },
        { value: "top-left", label: "Top-left" },
        { value: "top-right", label: "Top-right" },
        { value: "bottom-left", label: "Bottom-left" },
        { value: "bottom-right", label: "Bottom-right" },
        { value: "tile", label: "Tiled (repeat)" },
      ],
    },
  ],
  async run({ canvas, options }) {
    const watermarkSrc = String(options.watermarkSrc ?? "");
    const opacity = Number(options.opacity ?? 30) / 100;
    const scale = Number(options.scale ?? 25) / 100;
    const position = String(options.position ?? "center");

    const W = canvas.width;
    const H = canvas.height;
    const out = createCanvas(W, H);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    if (!watermarkSrc) return out;

    let wmCanvas: HTMLCanvasElement;
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load watermark"));
        img.src = watermarkSrc;
      });
      const wmW = Math.round(img.naturalWidth * scale);
      const wmH = Math.round(img.naturalHeight * scale);
      wmCanvas = createCanvas(wmW, wmH);
      get2D(wmCanvas).drawImage(img, 0, 0, wmW, wmH);
    } catch {
      return out;
    }

    ctx.globalAlpha = opacity;

    if (position === "tile") {
      const spacingX = wmCanvas.width + 20;
      const spacingY = wmCanvas.height + 20;
      for (let y = 0; y < H; y += spacingY) {
        for (let x = 0; x < W; x += spacingX) {
          ctx.drawImage(wmCanvas, x, y);
        }
      }
    } else {
      const pad = 20;
      let x: number;
      let y: number;

      switch (position) {
        case "top-left":
          x = pad;
          y = pad;
          break;
        case "top-right":
          x = W - wmCanvas.width - pad;
          y = pad;
          break;
        case "bottom-left":
          x = pad;
          y = H - wmCanvas.height - pad;
          break;
        case "bottom-right":
          x = W - wmCanvas.width - pad;
          y = H - wmCanvas.height - pad;
          break;
        default:
          x = Math.round((W - wmCanvas.width) / 2);
          y = Math.round((H - wmCanvas.height) / 2);
      }

      ctx.drawImage(wmCanvas, x, y);
    }

    ctx.globalAlpha = 1;
    return out;
  },
};
