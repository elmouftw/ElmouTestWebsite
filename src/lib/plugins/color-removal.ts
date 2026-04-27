import { createCanvas, get2D, hexToRgb, colorDistSq } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const colorRemovalPlugin: PluginDefinition = {
  id: "color-removal",
  name: "Color Removal",
  description:
    "Remove background colors with tolerance and edge processing.",
  icon: "🧹",
  version: "1.0.0",
  category: "cleanup",
  fields: [
    {
      key: "color",
      type: "color",
      label: "Target color",
      default: "#ffffff",
    },
    {
      key: "tolerance",
      type: "slider",
      label: "Tolerance",
      description: "How far from the target color to still remove.",
      default: 30,
      min: 0,
      max: 255,
      step: 1,
    },
    {
      key: "edgeSoftness",
      type: "slider",
      label: "Edge softness",
      description: "Blend edges for smoother cutouts.",
      default: 0,
      min: 0,
      max: 20,
      step: 1,
    },
    {
      key: "removeAll",
      type: "checkbox",
      label: "Remove all matching pixels",
      description:
        "When on, removes every matching pixel. When off, only removes matching pixels connected to the image border (background flood-fill).",
      default: true,
    },
  ],
  async run({ canvas, options }) {
    const [tr, tg, tb] = hexToRgb(String(options.color ?? "#ffffff"));
    const tolerance = Number(options.tolerance ?? 30);
    const edgeSoftness = Number(options.edgeSoftness ?? 0);
    const removeAll = Boolean(options.removeAll ?? true);
    const tolSq = tolerance * tolerance * 3;

    const W = canvas.width;
    const H = canvas.height;
    const out = createCanvas(W, H);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;

    const matches = (i: number) =>
      colorDistSq(d[i], d[i + 1], d[i + 2], tr, tg, tb) <= tolSq;

    if (removeAll) {
      for (let i = 0; i < d.length; i += 4) {
        if (!matches(i)) continue;
        applyRemoval(d, i, tolSq, tr, tg, tb, edgeSoftness);
      }
    } else {
      const visited = new Uint8Array(W * H);
      const queue: number[] = [];

      for (let x = 0; x < W; x++) {
        if (matches(x * 4)) { visited[x] = 1; queue.push(x); }
        const bot = (H - 1) * W + x;
        if (matches(bot * 4)) { visited[bot] = 1; queue.push(bot); }
      }
      for (let y = 1; y < H - 1; y++) {
        const left = y * W;
        if (matches(left * 4)) { visited[left] = 1; queue.push(left); }
        const right = y * W + W - 1;
        if (matches(right * 4)) { visited[right] = 1; queue.push(right); }
      }

      while (queue.length > 0) {
        const idx = queue.pop()!;
        applyRemoval(d, idx * 4, tolSq, tr, tg, tb, edgeSoftness);
        const x = idx % W;
        const y = (idx - x) / W;
        const neighbors = [
          y > 0 ? idx - W : -1,
          y < H - 1 ? idx + W : -1,
          x > 0 ? idx - 1 : -1,
          x < W - 1 ? idx + 1 : -1,
        ];
        for (const n of neighbors) {
          if (n >= 0 && !visited[n] && matches(n * 4)) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }
    }

    ctx.putImageData(img, 0, 0);
    return out;
  },
};

function applyRemoval(
  d: Uint8ClampedArray,
  i: number,
  tolSq: number,
  tr: number,
  tg: number,
  tb: number,
  edgeSoftness: number,
) {
  if (edgeSoftness > 0) {
    const dist = colorDistSq(d[i], d[i + 1], d[i + 2], tr, tg, tb);
    const ratio = dist / tolSq;
    const softStart = 1 - edgeSoftness / 20;
    if (ratio > softStart) {
      const t = (ratio - softStart) / (1 - softStart);
      d[i + 3] = Math.round(d[i + 3] * t);
    } else {
      d[i + 3] = 0;
    }
  } else {
    d[i + 3] = 0;
  }
}
