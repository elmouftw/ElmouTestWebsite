import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const clippingMaskPlugin: PluginDefinition = {
  id: "clipping-mask",
  name: "Clipping Mask",
  description:
    "Apply artistic clipping effects using another image as a mask.",
  icon: "🎭",
  version: "1.0.0",
  category: "effect",
  fields: [
    {
      key: "maskSrc",
      type: "file",
      label: "Mask image",
      default: "",
      accept: "image/*",
    },
    {
      key: "mode",
      type: "select",
      label: "Mask mode",
      default: "luminance",
      options: [
        { value: "luminance", label: "Luminance (bright = keep)" },
        { value: "alpha", label: "Alpha channel" },
        { value: "inverse", label: "Inverse luminance" },
      ],
    },
    {
      key: "fit",
      type: "select",
      label: "Mask fit",
      default: "stretch",
      options: [
        { value: "stretch", label: "Stretch to fit" },
        { value: "contain", label: "Contain" },
        { value: "cover", label: "Cover" },
        { value: "tile", label: "Tile" },
      ],
    },
  ],
  async run({ canvas, options }) {
    const maskSrc = String(options.maskSrc ?? "");
    const mode = String(options.mode ?? "luminance");
    const fit = String(options.fit ?? "stretch");

    const W = canvas.width;
    const H = canvas.height;
    const out = createCanvas(W, H);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    if (!maskSrc) return out;

    let maskImg: HTMLImageElement;
    try {
      maskImg = new Image();
      maskImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        maskImg.onload = () => resolve();
        maskImg.onerror = () => reject(new Error("Failed to load mask"));
        maskImg.src = maskSrc;
      });
    } catch {
      return out;
    }

    const maskCanvas = createCanvas(W, H);
    const mctx = get2D(maskCanvas);

    if (fit === "tile") {
      for (let y = 0; y < H; y += maskImg.naturalHeight) {
        for (let x = 0; x < W; x += maskImg.naturalWidth) {
          mctx.drawImage(maskImg, x, y);
        }
      }
    } else if (fit === "contain") {
      const scale = Math.min(W / maskImg.naturalWidth, H / maskImg.naturalHeight);
      const dw = maskImg.naturalWidth * scale;
      const dh = maskImg.naturalHeight * scale;
      mctx.drawImage(maskImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else if (fit === "cover") {
      const scale = Math.max(W / maskImg.naturalWidth, H / maskImg.naturalHeight);
      const dw = maskImg.naturalWidth * scale;
      const dh = maskImg.naturalHeight * scale;
      mctx.drawImage(maskImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      mctx.drawImage(maskImg, 0, 0, W, H);
    }

    const srcData = ctx.getImageData(0, 0, W, H);
    const maskData = mctx.getImageData(0, 0, W, H);
    const sd = srcData.data;
    const md = maskData.data;

    for (let i = 0; i < sd.length; i += 4) {
      let maskAlpha: number;
      if (mode === "alpha") {
        maskAlpha = md[i + 3] / 255;
      } else if (mode === "inverse") {
        const lum = (0.299 * md[i] + 0.587 * md[i + 1] + 0.114 * md[i + 2]) / 255;
        maskAlpha = 1 - lum;
      } else {
        maskAlpha = (0.299 * md[i] + 0.587 * md[i + 1] + 0.114 * md[i + 2]) / 255;
      }
      sd[i + 3] = Math.round(sd[i + 3] * maskAlpha);
    }

    ctx.putImageData(srcData, 0, 0);
    return out;
  },
};
