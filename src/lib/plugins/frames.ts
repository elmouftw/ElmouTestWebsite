import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

export const framesPlugin: PluginDefinition = {
  id: "frames",
  name: "Frames",
  description: "Apply decorative frame effects around images.",
  icon: "🖼️",
  version: "1.0.0",
  category: "effect",
  fields: [
    {
      key: "style",
      type: "select",
      label: "Frame style",
      default: "simple",
      options: [
        { value: "simple", label: "Simple border" },
        { value: "rounded", label: "Rounded corners" },
        { value: "circle", label: "Circle crop" },
        { value: "vignette", label: "Vignette fade" },
        { value: "torn", label: "Torn edges" },
      ],
    },
    {
      key: "size",
      type: "slider",
      label: "Frame size",
      default: 20,
      min: 0,
      max: 200,
      step: 1,
      unit: "px",
    },
    {
      key: "color",
      type: "color",
      label: "Frame color",
      default: "#000000",
    },
    {
      key: "cornerRadius",
      type: "slider",
      label: "Corner radius",
      description: "Only applies to rounded frame style.",
      default: 30,
      min: 0,
      max: 200,
      step: 1,
      unit: "px",
    },
  ],
  async run({ canvas, options }) {
    const style = String(options.style ?? "simple");
    const size = Number(options.size ?? 20);
    const color = String(options.color ?? "#000000");
    const cornerRadius = Number(options.cornerRadius ?? 30);

    const W = canvas.width;
    const H = canvas.height;

    if (style === "simple") {
      const outW = W + size * 2;
      const outH = H + size * 2;
      const out = createCanvas(outW, outH);
      const ctx = get2D(out);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(canvas, size, size);
      return out;
    }

    if (style === "rounded") {
      const outW = W + size * 2;
      const outH = H + size * 2;
      const out = createCanvas(outW, outH);
      const ctx = get2D(out);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, outW, outH);
      ctx.save();
      roundedRect(ctx, size, size, W, H, cornerRadius);
      ctx.clip();
      ctx.drawImage(canvas, size, size);
      ctx.restore();
      return out;
    }

    if (style === "circle") {
      const out = createCanvas(W, H);
      const ctx = get2D(out);
      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.min(cx, cy);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(canvas, 0, 0);
      return out;
    }

    if (style === "vignette") {
      const out = createCanvas(W, H);
      const ctx = get2D(out);
      ctx.drawImage(canvas, 0, 0);
      const cx = W / 2;
      const cy = H / 2;
      const outerRadius = Math.sqrt(cx * cx + cy * cy);
      const innerRadius = outerRadius * (1 - size / 100);
      const gradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, "rgba(0,0,0,0.8)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
      return out;
    }

    if (style === "torn") {
      const out = createCanvas(W, H);
      const ctx = get2D(out);
      ctx.drawImage(canvas, 0, 0);
      const img = ctx.getImageData(0, 0, W, H);
      const d = img.data;
      const edgeSize = Math.max(5, size);
      let s = 12345;
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const distToEdge = Math.min(x, y, W - 1 - x, H - 1 - y);
          if (distToEdge < edgeSize) {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            const noise = s / 0x7fffffff;
            const t = distToEdge / edgeSize;
            if (noise > t) {
              const idx = (y * W + x) * 4;
              d[idx + 3] = 0;
            }
          }
        }
      }
      ctx.putImageData(img, 0, 0);
      return out;
    }

    const out = createCanvas(W, H);
    get2D(out).drawImage(canvas, 0, 0);
    return out;
  },
};

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
