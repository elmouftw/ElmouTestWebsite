import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Image Adjustments — brightness / contrast / saturation / hue / gamma /
 * invert. Implemented as a single pass over the pixel buffer for speed.
 */
export const imageAdjustmentsPlugin: PluginDefinition = {
  id: "image-adjustments",
  name: "Image Adjustments",
  description: "Brightness, contrast, saturation, hue, gamma, and invert.",
  icon: "⚙️",
  version: "1.0.0",
  category: "color",
  fields: [
    {
      key: "brightness",
      type: "slider",
      label: "Brightness",
      default: 0,
      min: -100,
      max: 100,
      step: 1,
    },
    {
      key: "contrast",
      type: "slider",
      label: "Contrast",
      default: 0,
      min: -100,
      max: 100,
      step: 1,
    },
    {
      key: "saturation",
      type: "slider",
      label: "Saturation",
      default: 0,
      min: -100,
      max: 100,
      step: 1,
    },
    {
      key: "hue",
      type: "slider",
      label: "Hue shift",
      default: 0,
      min: -180,
      max: 180,
      step: 1,
      unit: "°",
    },
    {
      key: "gamma",
      type: "slider",
      label: "Gamma",
      default: 100,
      min: 10,
      max: 300,
      step: 1,
      unit: "%",
    },
    {
      key: "invert",
      type: "checkbox",
      label: "Invert colors",
      default: false,
    },
  ],
  async run({ canvas, options }) {
    const brightness = Number(options.brightness ?? 0); // -100..100
    const contrast = Number(options.contrast ?? 0); // -100..100
    const saturation = Number(options.saturation ?? 0); // -100..100
    const hue = Number(options.hue ?? 0); // degrees
    const gammaPct = Number(options.gamma ?? 100); // %
    const invert = Boolean(options.invert);

    const out = createCanvas(canvas.width, canvas.height);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;

    const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const bAdd = brightness * 2.55;
    const satMul = 1 + saturation / 100;
    const gamma = Math.max(0.05, gammaPct / 100);
    const gammaInv = 1 / gamma;
    const hueRad = (hue * Math.PI) / 180;
    const cosH = Math.cos(hueRad);
    const sinH = Math.sin(hueRad);

    // YIQ-based hue rotation matrix. Gives reasonable results without going
    // through full HSL/HSV conversion in the inner loop.
    const m00 = 0.299 + 0.701 * cosH + 0.168 * sinH;
    const m01 = 0.587 - 0.587 * cosH + 0.33 * sinH;
    const m02 = 0.114 - 0.114 * cosH - 0.497 * sinH;
    const m10 = 0.299 - 0.299 * cosH - 0.328 * sinH;
    const m11 = 0.587 + 0.413 * cosH + 0.035 * sinH;
    const m12 = 0.114 - 0.114 * cosH + 0.292 * sinH;
    const m20 = 0.299 - 0.3 * cosH + 1.25 * sinH;
    const m21 = 0.587 - 0.588 * cosH - 1.05 * sinH;
    const m22 = 0.114 + 0.886 * cosH - 0.203 * sinH;

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      // Hue rotation
      if (hue !== 0) {
        const nr = m00 * r + m01 * g + m02 * b;
        const ng = m10 * r + m11 * g + m12 * b;
        const nb = m20 * r + m21 * g + m22 * b;
        r = nr;
        g = ng;
        b = nb;
      }

      // Saturation
      if (saturation !== 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * satMul;
        g = gray + (g - gray) * satMul;
        b = gray + (b - gray) * satMul;
      }

      // Brightness
      if (brightness !== 0) {
        r += bAdd;
        g += bAdd;
        b += bAdd;
      }

      // Contrast
      if (contrast !== 0) {
        r = cFactor * (r - 128) + 128;
        g = cFactor * (g - 128) + 128;
        b = cFactor * (b - 128) + 128;
      }

      // Gamma
      if (gamma !== 1) {
        r = 255 * Math.pow(Math.max(0, r) / 255, gammaInv);
        g = 255 * Math.pow(Math.max(0, g) / 255, gammaInv);
        b = 255 * Math.pow(Math.max(0, b) / 255, gammaInv);
      }

      // Invert
      if (invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      d[i] = clamp(r);
      d[i + 1] = clamp(g);
      d[i + 2] = clamp(b);
    }

    ctx.putImageData(img, 0, 0);
    return out;
  },
};

function clamp(v: number): number {
  if (v < 0) return 0;
  if (v > 255) return 255;
  return v;
}
