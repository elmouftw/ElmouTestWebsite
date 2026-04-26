import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Distress — drop pixels probabilistically based on a value-noise field
 * to give the image a worn / weathered look.
 */
export const distressPlugin: PluginDefinition = {
  id: "distress",
  name: "Distress",
  description: "Add a worn, distressed effect by erasing pixels along a noise field.",
  icon: "📜",
  version: "1.0.0",
  category: "effect",
  fields: [
    {
      key: "amount",
      type: "slider",
      label: "Amount",
      default: 35,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
    {
      key: "scale",
      type: "slider",
      label: "Noise scale",
      description: "Larger values produce coarser distress patterns.",
      default: 4,
      min: 1,
      max: 32,
      step: 1,
    },
    {
      key: "seed",
      type: "number",
      label: "Seed",
      default: 1,
      min: 1,
      max: 999999,
      step: 1,
    },
  ],
  async run({ canvas, options }) {
    const amount = Number(options.amount ?? 35) / 100;
    const scale = Math.max(1, Number(options.scale ?? 4));
    const seed = Number(options.seed ?? 1) | 0;

    const out = createCanvas(canvas.width, canvas.height);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const W = canvas.width;
    const H = canvas.height;
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;

    // Pre-compute a small lattice of random values then bilinearly sample
    // it. This mimics value noise without pulling in a 3rd-party lib.
    const cellsX = Math.max(2, Math.ceil(W / scale));
    const cellsY = Math.max(2, Math.ceil(H / scale));
    const lattice = new Float32Array((cellsX + 1) * (cellsY + 1));
    let s = seed || 1;
    for (let i = 0; i < lattice.length; i++) {
      // xorshift32
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      lattice[i] = ((s >>> 0) % 100000) / 100000;
    }

    for (let y = 0; y < H; y++) {
      const fy = (y / H) * cellsY;
      const y0 = fy | 0;
      const ty = fy - y0;
      for (let x = 0; x < W; x++) {
        const fx = (x / W) * cellsX;
        const x0 = fx | 0;
        const tx = fx - x0;
        const a = lattice[y0 * (cellsX + 1) + x0];
        const b = lattice[y0 * (cellsX + 1) + x0 + 1];
        const c = lattice[(y0 + 1) * (cellsX + 1) + x0];
        const e = lattice[(y0 + 1) * (cellsX + 1) + x0 + 1];
        const ab = a + (b - a) * tx;
        const ce = c + (e - c) * tx;
        const noise = ab + (ce - ab) * ty;

        if (noise < amount) {
          const i = (y * W + x) * 4;
          d[i + 3] = Math.min(d[i + 3], Math.round(d[i + 3] * (noise / amount)));
        }
      }
    }

    ctx.putImageData(img, 0, 0);
    return out;
  },
};
