import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const filtersPlugin: PluginDefinition = {
  id: "filters",
  name: "Filters",
  description: "Apply visual filters like blur, sharpen, sepia, and more.",
  icon: "🎭",
  version: "1.0.0",
  category: "effect",
  fields: [
    {
      key: "filter",
      type: "select",
      label: "Filter",
      default: "none",
      options: [
        { value: "none", label: "None" },
        { value: "blur", label: "Blur" },
        { value: "sharpen", label: "Sharpen" },
        { value: "grayscale", label: "Grayscale" },
        { value: "sepia", label: "Sepia" },
        { value: "vintage", label: "Vintage" },
        { value: "cold", label: "Cold" },
        { value: "warm", label: "Warm" },
        { value: "emboss", label: "Emboss" },
        { value: "edge-detect", label: "Edge Detect" },
        { value: "posterize", label: "Posterize" },
        { value: "noise", label: "Add Noise" },
        { value: "pixelate", label: "Pixelate" },
      ],
    },
    {
      key: "strength",
      type: "slider",
      label: "Strength",
      default: 50,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
  ],
  async run({ canvas, options }) {
    const filter = String(options.filter ?? "none");
    const strength = Number(options.strength ?? 50) / 100;

    if (filter === "none") {
      const out = createCanvas(canvas.width, canvas.height);
      get2D(out).drawImage(canvas, 0, 0);
      return out;
    }

    const W = canvas.width;
    const H = canvas.height;
    const out = createCanvas(W, H);
    const ctx = get2D(out);

    if (filter === "blur") {
      const radius = Math.max(1, Math.round(strength * 20));
      ctx.filter = `blur(${radius}px)`;
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = "none";
      return out;
    }

    if (filter === "pixelate") {
      const blockSize = Math.max(2, Math.round(strength * 40));
      const smallW = Math.max(1, Math.round(W / blockSize));
      const smallH = Math.max(1, Math.round(H / blockSize));
      const tmp = createCanvas(smallW, smallH);
      const tctx = get2D(tmp);
      tctx.imageSmoothingEnabled = false;
      tctx.drawImage(canvas, 0, 0, smallW, smallH);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tmp, 0, 0, W, H);
      return out;
    }

    ctx.drawImage(canvas, 0, 0);
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;

    switch (filter) {
      case "grayscale":
        for (let i = 0; i < d.length; i += 4) {
          const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          d[i] = lerp(d[i], gray, strength);
          d[i + 1] = lerp(d[i + 1], gray, strength);
          d[i + 2] = lerp(d[i + 2], gray, strength);
        }
        break;

      case "sepia":
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const sr = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
          const sg = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
          const sb = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
          d[i] = lerp(r, sr, strength);
          d[i + 1] = lerp(g, sg, strength);
          d[i + 2] = lerp(b, sb, strength);
        }
        break;

      case "vintage":
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          d[i] = clamp(lerp(r, r * 1.1 + 20, strength));
          d[i + 1] = clamp(lerp(g, g * 0.9 + 10, strength));
          d[i + 2] = clamp(lerp(b, b * 0.8, strength));
        }
        break;

      case "cold":
        for (let i = 0; i < d.length; i += 4) {
          d[i] = clamp(lerp(d[i], d[i] * 0.9, strength));
          d[i + 2] = clamp(lerp(d[i + 2], d[i + 2] * 1.15 + 10, strength));
        }
        break;

      case "warm":
        for (let i = 0; i < d.length; i += 4) {
          d[i] = clamp(lerp(d[i], d[i] * 1.15 + 10, strength));
          d[i + 2] = clamp(lerp(d[i + 2], d[i + 2] * 0.9, strength));
        }
        break;

      case "posterize": {
        const levels = Math.max(2, Math.round(2 + (1 - strength) * 14));
        const step = 255 / (levels - 1);
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.round(Math.round(d[i] / step) * step);
          d[i + 1] = Math.round(Math.round(d[i + 1] / step) * step);
          d[i + 2] = Math.round(Math.round(d[i + 2] / step) * step);
        }
        break;
      }

      case "noise": {
        let s = 42;
        for (let i = 0; i < d.length; i += 4) {
          s = (s * 1103515245 + 12345) & 0x7fffffff;
          const n = ((s / 0x7fffffff) - 0.5) * 2 * strength * 100;
          d[i] = clamp(d[i] + n);
          d[i + 1] = clamp(d[i + 1] + n);
          d[i + 2] = clamp(d[i + 2] + n);
        }
        break;
      }

      case "sharpen":
        applySharpen(d, W, H, strength);
        break;

      case "emboss":
        applyConvolution(d, W, H, [
          -2, -1, 0,
          -1,  1, 1,
           0,  1, 2,
        ], strength);
        break;

      case "edge-detect":
        applyConvolution(d, W, H, [
          -1, -1, -1,
          -1,  8, -1,
          -1, -1, -1,
        ], strength);
        break;
    }

    ctx.putImageData(img, 0, 0);
    return out;
  },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function applySharpen(
  d: Uint8ClampedArray,
  W: number,
  H: number,
  strength: number,
) {
  const copy = new Uint8ClampedArray(d);
  const k = strength * 2;
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const idx = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        const sum =
          copy[((y - 1) * W + x) * 4 + c] +
          copy[((y + 1) * W + x) * 4 + c] +
          copy[(y * W + x - 1) * 4 + c] +
          copy[(y * W + x + 1) * 4 + c];
        d[idx + c] = clamp(center + k * (center - sum / 4));
      }
    }
  }
}

function applyConvolution(
  d: Uint8ClampedArray,
  W: number,
  H: number,
  kernel: number[],
  strength: number,
) {
  const copy = new Uint8ClampedArray(d);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const idx = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum += copy[((y + ky) * W + (x + kx)) * 4 + c] * kernel[ki++];
          }
        }
        d[idx + c] = clamp(lerp(copy[idx + c], sum, strength));
      }
    }
  }
}
