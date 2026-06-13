import { createCanvas, get2D, hexToRgb } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Padding — add configurable padding around the image. Supports either
 * uniform pixel padding or percentage-of-largest-side padding, plus an
 * optional fill color (defaults to transparent).
 */
export const paddingPlugin: PluginDefinition = {
  id: "padding",
  name: "Padding",
  description: "Add customizable padding around images.",
  icon: "📏",
  version: "1.0.0",
  category: "geometry",
  fields: [
    {
      key: "mode",
      type: "select",
      label: "Mode",
      default: "pixels",
      options: [
        { value: "pixels", label: "Pixels" },
        { value: "percent", label: "Percent" },
      ],
    },
    {
      key: "amount",
      type: "number",
      label: "Amount",
      default: 32,
      min: 0,
      max: 4096,
      step: 1,
    },
    {
      key: "fill",
      type: "color",
      label: "Fill color",
      default: "#ffffff",
    },
    {
      key: "transparent",
      type: "checkbox",
      label: "Transparent fill",
      default: false,
    },
  ],
  async run({ canvas, options }) {
    const mode = String(options.mode ?? "pixels");
    const amount = Number(options.amount ?? 0);
    const transparent = Boolean(options.transparent);
    const fill = String(options.fill ?? "#ffffff");

    const padPx =
      mode === "percent"
        ? Math.round((amount / 100) * Math.max(canvas.width, canvas.height))
        : Math.round(amount);

    const W = canvas.width + padPx * 2;
    const H = canvas.height + padPx * 2;
    const out = createCanvas(W, H);
    const ctx = get2D(out);

    if (!transparent) {
      const [r, g, b] = hexToRgb(fill);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.drawImage(canvas, padPx, padPx);
    return out;
  },
};
