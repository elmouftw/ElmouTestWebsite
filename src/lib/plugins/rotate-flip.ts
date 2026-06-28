import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const rotateFlipPlugin: PluginDefinition = {
  id: "rotate-flip",
  name: "Rotate / Flip",
  description: "Rotate and flip images.",
  icon: "🔄",
  version: "1.0.0",
  category: "geometry",
  fields: [
    {
      key: "rotation",
      type: "select",
      label: "Rotation",
      default: "0",
      options: [
        { value: "0", label: "None" },
        { value: "90", label: "90° clockwise" },
        { value: "180", label: "180°" },
        { value: "270", label: "270° clockwise" },
      ],
    },
    {
      key: "flipH",
      type: "checkbox",
      label: "Flip horizontal",
      default: false,
    },
    {
      key: "flipV",
      type: "checkbox",
      label: "Flip vertical",
      default: false,
    },
  ],
  async run({ canvas, options }) {
    const rotation = Number(options.rotation ?? 0);
    const flipH = Boolean(options.flipH);
    const flipV = Boolean(options.flipV);

    const needsSwap = rotation === 90 || rotation === 270;
    const outW = needsSwap ? canvas.height : canvas.width;
    const outH = needsSwap ? canvas.width : canvas.height;

    const out = createCanvas(outW, outH);
    const ctx = get2D(out);

    ctx.save();
    ctx.translate(outW / 2, outH / 2);

    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }

    const scaleX = flipH ? -1 : 1;
    const scaleY = flipV ? -1 : 1;
    ctx.scale(scaleX, scaleY);

    ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
    ctx.restore();

    return out;
  },
};
