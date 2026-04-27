import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const speckleRemoverPlugin: PluginDefinition = {
  id: "speckle-remover",
  name: "Speckle Remover",
  description: "Find and remove isolated pixel fragments.",
  icon: "✨",
  version: "1.0.0",
  category: "cleanup",
  fields: [
    {
      key: "threshold",
      type: "slider",
      label: "Size threshold",
      description:
        "Connected regions smaller than this (in pixels) are removed.",
      default: 10,
      min: 1,
      max: 500,
      step: 1,
      unit: "px",
    },
    {
      key: "alphaThreshold",
      type: "slider",
      label: "Alpha threshold",
      description: "Pixels with alpha above this are considered opaque.",
      default: 128,
      min: 1,
      max: 255,
      step: 1,
    },
  ],
  async run({ canvas, options }) {
    const threshold = Number(options.threshold ?? 10);
    const alphaThreshold = Number(options.alphaThreshold ?? 128);

    const W = canvas.width;
    const H = canvas.height;
    const out = createCanvas(W, H);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;

    const labels = new Int32Array(W * H);
    let nextLabel = 1;
    const labelSizes = new Map<number, number>();

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        if (d[idx * 4 + 3] <= alphaThreshold || labels[idx] !== 0) continue;

        const label = nextLabel++;
        const queue = [idx];
        let size = 0;
        labels[idx] = label;

        while (queue.length > 0) {
          const cur = queue.pop()!;
          size++;
          const cx = cur % W;
          const cy = (cur - cx) / W;

          const neighbors = [
            cy > 0 ? cur - W : -1,
            cy < H - 1 ? cur + W : -1,
            cx > 0 ? cur - 1 : -1,
            cx < W - 1 ? cur + 1 : -1,
          ];

          for (const n of neighbors) {
            if (n >= 0 && labels[n] === 0 && d[n * 4 + 3] > alphaThreshold) {
              labels[n] = label;
              queue.push(n);
            }
          }
        }

        labelSizes.set(label, size);
      }
    }

    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (label > 0 && (labelSizes.get(label) ?? 0) < threshold) {
        d[i * 4 + 3] = 0;
      }
    }

    ctx.putImageData(img, 0, 0);
    return out;
  },
};
