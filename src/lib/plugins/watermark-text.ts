import { createCanvas, get2D, hexToRgb } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const watermarkTextPlugin: PluginDefinition = {
  id: "watermark-text",
  name: "Watermark Text",
  description:
    "Add text watermarks with position, opacity, and tiling.",
  icon: "🔤",
  version: "1.0.0",
  category: "effect",
  fields: [
    {
      key: "text",
      type: "text",
      label: "Watermark text",
      default: "SAMPLE",
      placeholder: "Enter watermark text",
    },
    {
      key: "fontSize",
      type: "slider",
      label: "Font size",
      default: 48,
      min: 8,
      max: 200,
      step: 1,
      unit: "px",
    },
    {
      key: "color",
      type: "color",
      label: "Text color",
      default: "#000000",
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
    {
      key: "rotation",
      type: "slider",
      label: "Rotation",
      default: -30,
      min: -90,
      max: 90,
      step: 1,
      unit: "°",
    },
    {
      key: "fontFamily",
      type: "select",
      label: "Font",
      default: "sans-serif",
      options: [
        { value: "sans-serif", label: "Sans-serif" },
        { value: "serif", label: "Serif" },
        { value: "monospace", label: "Monospace" },
        { value: "cursive", label: "Cursive" },
      ],
    },
  ],
  async run({ canvas, options }) {
    const text = String(options.text ?? "SAMPLE");
    const fontSize = Number(options.fontSize ?? 48);
    const [r, g, b] = hexToRgb(String(options.color ?? "#000000"));
    const opacity = Number(options.opacity ?? 30) / 100;
    const position = String(options.position ?? "center");
    const rotation = Number(options.rotation ?? -30);
    const fontFamily = String(options.fontFamily ?? "sans-serif");

    const W = canvas.width;
    const H = canvas.height;
    const out = createCanvas(W, H);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    ctx.globalAlpha = opacity;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    if (position === "tile") {
      const metrics = ctx.measureText(text);
      const tw = metrics.width + fontSize;
      const th = fontSize * 2;
      const rad = (rotation * Math.PI) / 180;

      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(rad);

      const diag = Math.sqrt(W * W + H * H);
      const startX = -diag;
      const startY = -diag;

      for (let y = startY; y < diag; y += th) {
        for (let x = startX; x < diag; x += tw) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();
    } else {
      const pad = fontSize * 0.5;
      let x: number;
      let y: number;

      switch (position) {
        case "top-left":
          x = pad + fontSize;
          y = pad + fontSize / 2;
          break;
        case "top-right":
          x = W - pad - fontSize;
          y = pad + fontSize / 2;
          break;
        case "bottom-left":
          x = pad + fontSize;
          y = H - pad - fontSize / 2;
          break;
        case "bottom-right":
          x = W - pad - fontSize;
          y = H - pad - fontSize / 2;
          break;
        default:
          x = W / 2;
          y = H / 2;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    return out;
  },
};
