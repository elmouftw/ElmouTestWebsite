import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const distressPlugin: PluginDefinition = {
  id: "distress",
  name: "Distress",
  description:
    "Create knockout/transparency effects using a procedural distress texture.",
  icon: "🪨",
  version: "1.0.0",
  category: "effect",
  fields: [
    {
      key: "intensity",
      type: "slider",
      label: "Intensity",
      description: "How much of the image is distressed.",
      default: 50,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
    {
      key: "scale",
      type: "slider",
      label: "Grain scale",
      description: "Size of the distress grain pattern.",
      default: 3,
      min: 1,
      max: 20,
      step: 1,
      unit: "px",
    },
    {
      key: "seed",
      type: "number",
      label: "Seed",
      description: "Random seed for reproducible results.",
      default: 42,
      min: 0,
      max: 99999,
      step: 1,
    },
    {
      key: "invert",
      type: "checkbox",
      label: "Invert mask",
      default: false,
    },
  ],
  async run({ canvas, options }) {
    const intensity = Number(options.intensity ?? 50) / 100;
    const scale = Math.max(1, Number(options.scale ?? 3));
    const seed = Number(options.seed ?? 42);
    const invert = Boolean(options.invert);

    const W = canvas.width;
    const H = canvas.height;
    const out = createCanvas(W, H);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;

    const sW = Math.ceil(W / scale);
    const sH = Math.ceil(H / scale);
    const noise = new Float32Array(sW * sH);
    let s = seed;
    for (let i = 0; i < noise.length; i++) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      noise[i] = (s / 0x7fffffff);
    }

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = (y * W + x) * 4;
        if (d[idx + 3] === 0) continue;

        const nx = Math.min(Math.floor(x / scale), sW - 1);
        const ny = Math.min(Math.floor(y / scale), sH - 1);
        let n = noise[ny * sW + nx];
        if (invert) n = 1 - n;

        if (n < intensity) {
          const t = n / intensity;
          d[idx + 3] = Math.round(d[idx + 3] * t);
        }
      }
    }

    ctx.putImageData(img, 0, 0);
    return out;
  },
};
