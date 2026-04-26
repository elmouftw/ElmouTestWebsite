import { createCanvas, get2D, hexToRgb } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Strokes — add a colored outline around opaque pixels by drawing the
 * source image multiple times offset around a circle and tinting the
 * result, then compositing the original on top. Fast and good enough for
 * UI badges, sticker exports, etc.
 */
export const strokesPlugin: PluginDefinition = {
  id: "strokes",
  name: "Strokes",
  description: "Add a colored outline around opaque areas of the image.",
  icon: "✏️",
  version: "1.0.0",
  category: "effect",
  fields: [
    {
      key: "color",
      type: "color",
      label: "Stroke color",
      default: "#000000",
    },
    {
      key: "thickness",
      type: "slider",
      label: "Thickness",
      default: 6,
      min: 1,
      max: 64,
      step: 1,
      unit: "px",
    },
    {
      key: "samples",
      type: "slider",
      label: "Samples",
      description: "Higher = smoother outline, slower processing.",
      default: 16,
      min: 4,
      max: 32,
      step: 1,
    },
    {
      key: "expandCanvas",
      type: "checkbox",
      label: "Expand canvas to fit stroke",
      default: true,
    },
  ],
  async run({ canvas, options }) {
    const [r, g, b] = hexToRgb(String(options.color ?? "#000000"));
    const thickness = Math.max(1, Number(options.thickness ?? 6));
    const samples = Math.max(4, Math.min(64, Number(options.samples ?? 16)));
    const expand = Boolean(options.expandCanvas);

    const pad = expand ? thickness : 0;
    const W = canvas.width + pad * 2;
    const H = canvas.height + pad * 2;

    // Render the image into a tinted "stamp" canvas: silhouette in stroke color.
    const stamp = createCanvas(canvas.width, canvas.height);
    const stampCtx = get2D(stamp);
    stampCtx.drawImage(canvas, 0, 0);
    const id = stampCtx.getImageData(0, 0, canvas.width, canvas.height);
    const sd = id.data;
    for (let i = 0; i < sd.length; i += 4) {
      if (sd[i + 3] > 0) {
        sd[i] = r;
        sd[i + 1] = g;
        sd[i + 2] = b;
      }
    }
    stampCtx.putImageData(id, 0, 0);

    const out = createCanvas(W, H);
    const ctx = get2D(out);

    // Stamp the silhouette around a circle at `thickness` radius.
    for (let i = 0; i < samples; i++) {
      const theta = (i / samples) * Math.PI * 2;
      const dx = Math.cos(theta) * thickness;
      const dy = Math.sin(theta) * thickness;
      ctx.drawImage(stamp, pad + dx, pad + dy);
    }

    // Composite the original image on top.
    ctx.drawImage(canvas, pad, pad);
    return out;
  },
};
