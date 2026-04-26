import { createCanvas, get2D } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Speckle Remover — find connected clusters of opaque pixels smaller than
 * a configurable size and erase them. Implemented as a flood fill in
 * scanline-style with an explicit stack to avoid recursion blow-ups on
 * large images.
 */
export const speckleRemoverPlugin: PluginDefinition = {
  id: "speckle-remover",
  name: "Speckle Remover",
  description:
    "Remove isolated pixel clusters smaller than a configurable size.",
  icon: "✨",
  version: "1.0.0",
  category: "cleanup",
  fields: [
    {
      key: "maxSize",
      type: "slider",
      label: "Max cluster size",
      description: "Connected components with at most this many pixels are removed.",
      default: 12,
      min: 1,
      max: 256,
      step: 1,
    },
    {
      key: "alphaThreshold",
      type: "slider",
      label: "Alpha threshold",
      description: "Pixels with alpha at or below this are treated as empty.",
      default: 16,
      min: 0,
      max: 254,
      step: 1,
    },
  ],
  async run({ canvas, options }) {
    const maxSize = Math.max(1, Number(options.maxSize ?? 12));
    const alphaThreshold = Number(options.alphaThreshold ?? 16);

    const out = createCanvas(canvas.width, canvas.height);
    const ctx = get2D(out);
    ctx.drawImage(canvas, 0, 0);

    const W = canvas.width;
    const H = canvas.height;
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;

    const visited = new Uint8Array(W * H);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        if (visited[idx]) continue;
        if (d[idx * 4 + 3] <= alphaThreshold) {
          visited[idx] = 1;
          continue;
        }

        // BFS to discover the connected component.
        const cluster: number[] = [idx];
        visited[idx] = 1;
        let head = 0;
        while (head < cluster.length) {
          const i = cluster[head++];
          const cx = i % W;
          const cy = (i - cx) / W;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
              const ni = ny * W + nx;
              if (visited[ni]) continue;
              if (d[ni * 4 + 3] <= alphaThreshold) {
                visited[ni] = 1;
                continue;
              }
              visited[ni] = 1;
              cluster.push(ni);
              // Bail out early — once a cluster is bigger than the limit it
              // will never be removed, so further exploration is wasted work
              // for the *current* purpose.
              if (cluster.length > maxSize * 8) break;
            }
            if (cluster.length > maxSize * 8) break;
          }
        }

        if (cluster.length <= maxSize) {
          for (const i of cluster) d[i * 4 + 3] = 0;
        }
      }
    }

    ctx.putImageData(img, 0, 0);
    return out;
  },
};
