import { createCanvas, get2D, hexToRgb } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Background Color — composite the image on top of a solid color
 * background. Useful when exporting a PNG with transparency to a JPEG.
 */
export const backgroundColorPlugin: PluginDefinition = {
  id: "background-color",
  name: "Background Color",
  description: "Add a solid colored background behind the image.",
  icon: "🎨",
  version: "1.0.0",
  category: "color",
  fields: [
    {
      key: "color",
      type: "color",
      label: "Color",
      default: "#ffffff",
    },
  ],
  async run({ canvas, options }) {
    const color = String(options.color ?? "#ffffff");
    const [r, g, b] = hexToRgb(color);
    const out = createCanvas(canvas.width, canvas.height);
    const ctx = get2D(out);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvas, 0, 0);
    return out;
  },
};
