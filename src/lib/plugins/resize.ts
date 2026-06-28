import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const resizePlugin: PluginDefinition = {
  id: "resize",
  name: "Resize",
  description: "High-quality image resizing with configurable dimensions.",
  icon: "↔️",
  version: "1.0.0",
  category: "geometry",
  fields: [
    {
      key: "mode",
      type: "select",
      label: "Mode",
      default: "percentage",
      options: [
        { value: "percentage", label: "Percentage" },
        { value: "width", label: "By width (px)" },
        { value: "height", label: "By height (px)" },
        { value: "exact", label: "Exact (px)" },
        { value: "longest", label: "Longest side (px)" },
        { value: "shortest", label: "Shortest side (px)" },
      ],
    },
    {
      key: "width",
      type: "number",
      label: "Width",
      default: 1024,
      min: 1,
      max: 16384,
      step: 1,
    },
    {
      key: "height",
      type: "number",
      label: "Height",
      default: 1024,
      min: 1,
      max: 16384,
      step: 1,
    },
    {
      key: "percentage",
      type: "slider",
      label: "Scale %",
      default: 100,
      min: 1,
      max: 400,
      step: 1,
      unit: "%",
    },
    {
      key: "maintainAspect",
      type: "checkbox",
      label: "Maintain aspect ratio",
      default: true,
    },
    {
      key: "interpolation",
      type: "select",
      label: "Interpolation",
      default: "high",
      options: [
        { value: "high", label: "High quality (smooth)" },
        { value: "medium", label: "Medium" },
        { value: "pixelated", label: "Pixelated (nearest)" },
      ],
    },
  ],
  async run({ canvas, options }) {
    const mode = String(options.mode ?? "percentage");
    const targetW = Number(options.width ?? 1024);
    const targetH = Number(options.height ?? 1024);
    const percentage = Number(options.percentage ?? 100);
    const maintainAspect = Boolean(options.maintainAspect ?? true);
    const interpolation = String(options.interpolation ?? "high");

    let newW: number;
    let newH: number;

    switch (mode) {
      case "percentage":
        newW = Math.round(canvas.width * (percentage / 100));
        newH = Math.round(canvas.height * (percentage / 100));
        break;
      case "width":
        newW = targetW;
        newH = maintainAspect
          ? Math.round(canvas.height * (targetW / canvas.width))
          : targetH;
        break;
      case "height":
        newH = targetH;
        newW = maintainAspect
          ? Math.round(canvas.width * (targetH / canvas.height))
          : targetW;
        break;
      case "longest": {
        const longest = Math.max(canvas.width, canvas.height);
        const scale = targetW / longest;
        newW = Math.round(canvas.width * scale);
        newH = Math.round(canvas.height * scale);
        break;
      }
      case "shortest": {
        const shortest = Math.min(canvas.width, canvas.height);
        const scale = targetW / shortest;
        newW = Math.round(canvas.width * scale);
        newH = Math.round(canvas.height * scale);
        break;
      }
      default:
        newW = targetW;
        newH = targetH;
    }

    newW = Math.max(1, newW);
    newH = Math.max(1, newH);

    const out = createCanvas(newW, newH);
    const ctx = get2D(out);

    if (interpolation === "pixelated") {
      ctx.imageSmoothingEnabled = false;
    } else {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality =
        interpolation === "high" ? "high" : "medium";
    }

    ctx.drawImage(canvas, 0, 0, newW, newH);
    return out;
  },
};
