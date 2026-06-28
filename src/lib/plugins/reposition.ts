import { createCanvas, get2D, hexToRgb } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const repositionPlugin: PluginDefinition = {
  id: "reposition",
  name: "Reposition",
  description: "Position image on a custom-sized canvas.",
  icon: "📐",
  version: "1.0.0",
  category: "geometry",
  fields: [
    {
      key: "canvasWidth",
      type: "number",
      label: "Canvas width",
      default: 1024,
      min: 1,
      max: 16384,
      step: 1,
    },
    {
      key: "canvasHeight",
      type: "number",
      label: "Canvas height",
      default: 1024,
      min: 1,
      max: 16384,
      step: 1,
    },
    {
      key: "anchorX",
      type: "select",
      label: "Horizontal anchor",
      default: "center",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
      ],
    },
    {
      key: "anchorY",
      type: "select",
      label: "Vertical anchor",
      default: "center",
      options: [
        { value: "top", label: "Top" },
        { value: "center", label: "Center" },
        { value: "bottom", label: "Bottom" },
      ],
    },
    {
      key: "offsetX",
      type: "number",
      label: "X offset (px)",
      default: 0,
      min: -8192,
      max: 8192,
      step: 1,
    },
    {
      key: "offsetY",
      type: "number",
      label: "Y offset (px)",
      default: 0,
      min: -8192,
      max: 8192,
      step: 1,
    },
    {
      key: "fill",
      type: "color",
      label: "Background color",
      default: "#ffffff",
    },
    {
      key: "transparent",
      type: "checkbox",
      label: "Transparent background",
      default: true,
    },
    {
      key: "fitMode",
      type: "select",
      label: "Fit mode",
      default: "none",
      options: [
        { value: "none", label: "No scaling" },
        { value: "contain", label: "Contain (fit inside)" },
        { value: "cover", label: "Cover (fill canvas)" },
        { value: "stretch", label: "Stretch" },
      ],
    },
  ],
  async run({ canvas, options }) {
    const cW = Math.max(1, Number(options.canvasWidth ?? 1024));
    const cH = Math.max(1, Number(options.canvasHeight ?? 1024));
    const anchorX = String(options.anchorX ?? "center");
    const anchorY = String(options.anchorY ?? "center");
    const offsetX = Number(options.offsetX ?? 0);
    const offsetY = Number(options.offsetY ?? 0);
    const transparent = Boolean(options.transparent ?? true);
    const fill = String(options.fill ?? "#ffffff");
    const fitMode = String(options.fitMode ?? "none");

    const out = createCanvas(cW, cH);
    const ctx = get2D(out);

    if (!transparent) {
      const [r, g, b] = hexToRgb(fill);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(0, 0, cW, cH);
    }

    let drawW = canvas.width;
    let drawH = canvas.height;

    switch (fitMode) {
      case "contain": {
        const scale = Math.min(cW / canvas.width, cH / canvas.height);
        drawW = Math.round(canvas.width * scale);
        drawH = Math.round(canvas.height * scale);
        break;
      }
      case "cover": {
        const scale = Math.max(cW / canvas.width, cH / canvas.height);
        drawW = Math.round(canvas.width * scale);
        drawH = Math.round(canvas.height * scale);
        break;
      }
      case "stretch":
        drawW = cW;
        drawH = cH;
        break;
    }

    let x: number;
    switch (anchorX) {
      case "left":
        x = 0;
        break;
      case "right":
        x = cW - drawW;
        break;
      default:
        x = Math.round((cW - drawW) / 2);
    }

    let y: number;
    switch (anchorY) {
      case "top":
        y = 0;
        break;
      case "bottom":
        y = cH - drawH;
        break;
      default:
        y = Math.round((cH - drawH) / 2);
    }

    x += offsetX;
    y += offsetY;

    ctx.drawImage(canvas, x, y, drawW, drawH);
    return out;
  },
};
