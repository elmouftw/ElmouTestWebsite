import { createCanvas, get2D, hexToRgb } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Reposition — set an explicit canvas size and place the (optionally
 * scaled) image inside it at one of nine anchor positions. Useful for
 * normalizing images to a uniform output size.
 */
export const repositionPlugin: PluginDefinition = {
  id: "reposition",
  name: "Reposition",
  description: "Resize the canvas and place the image at one of nine anchors.",
  icon: "🎯",
  version: "1.0.0",
  category: "geometry",
  fields: [
    { key: "width", type: "number", label: "Canvas width", default: 1024, min: 1, max: 16384, step: 1 },
    { key: "height", type: "number", label: "Canvas height", default: 1024, min: 1, max: 16384, step: 1 },
    {
      key: "fit",
      type: "select",
      label: "Fit",
      default: "contain",
      options: [
        { value: "none", label: "None (no scale)" },
        { value: "contain", label: "Contain" },
        { value: "cover", label: "Cover" },
      ],
    },
    {
      key: "anchor",
      type: "select",
      label: "Anchor",
      default: "center",
      options: [
        { value: "top-left", label: "Top left" },
        { value: "top", label: "Top" },
        { value: "top-right", label: "Top right" },
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
        { value: "bottom-left", label: "Bottom left" },
        { value: "bottom", label: "Bottom" },
        { value: "bottom-right", label: "Bottom right" },
      ],
    },
    { key: "fill", type: "color", label: "Fill color", default: "#ffffff" },
    { key: "transparent", type: "checkbox", label: "Transparent fill", default: true },
  ],
  async run({ canvas, options }) {
    const W = Math.max(1, Number(options.width ?? 1024));
    const H = Math.max(1, Number(options.height ?? 1024));
    const fit = String(options.fit ?? "contain");
    const anchor = String(options.anchor ?? "center");
    const transparent = Boolean(options.transparent);
    const fill = String(options.fill ?? "#ffffff");

    const out = createCanvas(W, H);
    const ctx = get2D(out);
    if (!transparent) {
      const [r, g, b] = hexToRgb(fill);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, 0, W, H);
    }

    let drawW = canvas.width;
    let drawH = canvas.height;
    if (fit !== "none") {
      const sx = W / canvas.width;
      const sy = H / canvas.height;
      const scale = fit === "contain" ? Math.min(sx, sy) : Math.max(sx, sy);
      drawW = canvas.width * scale;
      drawH = canvas.height * scale;
    }

    const [hPos, vPos] = parseAnchor(anchor);
    const x = (W - drawW) * hPos;
    const y = (H - drawH) * vPos;

    ctx.drawImage(canvas, x, y, drawW, drawH);
    return out;
  },
};

/** Returns horizontal then vertical anchor weights in [0,1]. */
function parseAnchor(anchor: string): [number, number] {
  const map: Record<string, [number, number]> = {
    "top-left": [0, 0],
    top: [0.5, 0],
    "top-right": [1, 0],
    left: [0, 0.5],
    center: [0.5, 0.5],
    right: [1, 0.5],
    "bottom-left": [0, 1],
    bottom: [0.5, 1],
    "bottom-right": [1, 1],
  };
  return map[anchor] ?? [0.5, 0.5];
}
