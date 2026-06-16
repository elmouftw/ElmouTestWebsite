import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Clipping Mask — clip the image to a geometric shape (circle, rounded
 * rect, square, ellipse). Useful for avatars and product crops.
 */
export const clippingMaskPlugin: PluginDefinition = {
  id: "clipping-mask",
  name: "Clipping Mask",
  description: "Clip the image to a geometric shape (circle, rounded rect, ellipse, square).",
  icon: "✂️",
  version: "1.0.0",
  category: "geometry",
  fields: [
    {
      key: "shape",
      type: "select",
      label: "Shape",
      default: "circle",
      options: [
        { value: "circle", label: "Circle" },
        { value: "ellipse", label: "Ellipse" },
        { value: "square", label: "Square (centered)" },
        { value: "rounded", label: "Rounded rectangle" },
      ],
    },
    {
      key: "radius",
      type: "slider",
      label: "Corner radius (rounded only)",
      default: 24,
      min: 0,
      max: 256,
      step: 1,
      unit: "px",
    },
    {
      key: "padding",
      type: "slider",
      label: "Inset",
      description: "Distance from the canvas edge in percent of the shorter side.",
      default: 0,
      min: 0,
      max: 40,
      step: 1,
      unit: "%",
    },
  ],
  async run({ canvas, options }) {
    const shape = String(options.shape ?? "circle");
    const radius = Number(options.radius ?? 24);
    const insetPct = Number(options.padding ?? 0) / 100;

    const W = canvas.width;
    const H = canvas.height;
    const inset = Math.round(Math.min(W, H) * insetPct);
    const x = inset;
    const y = inset;
    const w = W - inset * 2;
    const h = H - inset * 2;

    const out = createCanvas(W, H);
    const ctx = get2D(out);
    ctx.save();
    ctx.beginPath();
    if (shape === "circle") {
      const r = Math.min(w, h) / 2;
      ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
    } else if (shape === "ellipse") {
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    } else if (shape === "square") {
      const side = Math.min(w, h);
      ctx.rect(x + (w - side) / 2, y + (h - side) / 2, side, side);
    } else {
      // rounded
      const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    ctx.clip();
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
    return out;
  },
};
