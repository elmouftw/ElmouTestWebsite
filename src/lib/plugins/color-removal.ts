import {
  colorDistSq,
  createCanvas,
  get2D,
  hexToRgb,
} from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Color Removal — make pixels transparent if they fall within a tolerance
 * of any of the up-to-three target colors. Useful for clearing flat photo
 * backgrounds without a full ML model.
 */
export const colorRemovalPlugin: PluginDefinition = {
  id: "color-removal",
  name: "Color Removal",
  description:
    "Make pixels transparent that match one or more target colors within a tolerance.",
  icon: "🎯",
  version: "2.0.0",
  category: "color",
  fields: [
    { key: "color1", type: "color", label: "Color 1", default: "#ffffff" },
    {
      key: "useColor2",
      type: "checkbox",
      label: "Use color 2",
      default: false,
    },
    { key: "color2", type: "color", label: "Color 2", default: "#000000" },
    {
      key: "useColor3",
      type: "checkbox",
      label: "Use color 3",
      default: false,
    },
    { key: "color3", type: "color", label: "Color 3", default: "#808080" },
    {
      key: "tolerance",
      type: "slider",
      label: "Tolerance",
      description: "Higher values remove more variation around each color.",
      default: 60,
      min: 0,
      max: 200,
      step: 1,
    },
    {
      key: "feather",
      type: "slider",
      label: "Edge feather",
      description:
        "Soften alpha around the tolerance boundary so anti-aliased edges fade out smoothly.",
      default: 24,
      min: 0,
      max: 100,
      step: 1,
    },
  ],
  async run({ canvas, options }) {
    const tolerance = Number(options.tolerance ?? 32);
    const feather = Number(options.feather ?? 0);
    const tolSq = tolerance * tolerance * 3; // RGB cube; matches colorDistSq scale
    const featherSq = feather > 0 ? feather * feather * 3 : 0;

    const targets: [number, number, number][] = [hexToRgb(String(options.color1))];
    if (options.useColor2) targets.push(hexToRgb(String(options.color2)));
    if (options.useColor3) targets.push(hexToRgb(String(options.color3)));

    const out = createCanvas(canvas.width, canvas.height);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];

      let bestSq = Number.POSITIVE_INFINITY;
      for (const [tr, tg, tb] of targets) {
        const ds = colorDistSq(r, g, b, tr, tg, tb);
        if (ds < bestSq) bestSq = ds;
      }

      if (bestSq <= tolSq) {
        d[i + 3] = 0;
      } else if (featherSq > 0 && bestSq <= tolSq + featherSq) {
        const ratio = (bestSq - tolSq) / featherSq;
        d[i + 3] = Math.round(d[i + 3] * Math.min(1, Math.max(0, ratio)));
      }
    }
    ctx.putImageData(img, 0, 0);
    return out;
  },
};
