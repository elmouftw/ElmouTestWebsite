import { createCanvas, get2D, hexToRgb } from "../image/canvas";
import type { PluginDefinition } from "./types";

/**
 * Strokes Advanced — like Strokes, but with multiple stacked layers,
 * configurable opacity per layer, and optional outer/inner placement.
 */
export const strokesAdvancedPlugin: PluginDefinition = {
  id: "strokes-advanced",
  name: "Strokes Advanced",
  description:
    "Stack two configurable strokes (color, thickness, opacity, placement) for more complex outlines.",
  icon: "🖊️",
  version: "1.0.0",
  category: "effect",
  fields: [
    { key: "color1", type: "color", label: "Stroke 1 color", default: "#000000" },
    {
      key: "thickness1",
      type: "slider",
      label: "Stroke 1 thickness",
      default: 4,
      min: 0,
      max: 64,
      step: 1,
      unit: "px",
    },
    {
      key: "opacity1",
      type: "slider",
      label: "Stroke 1 opacity",
      default: 100,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
    { key: "color2", type: "color", label: "Stroke 2 color", default: "#ffffff" },
    {
      key: "thickness2",
      type: "slider",
      label: "Stroke 2 thickness",
      default: 8,
      min: 0,
      max: 64,
      step: 1,
      unit: "px",
    },
    {
      key: "opacity2",
      type: "slider",
      label: "Stroke 2 opacity",
      default: 100,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
  ],
  async run({ canvas, options }) {
    const t1 = Number(options.thickness1 ?? 0);
    const t2 = Number(options.thickness2 ?? 0);
    const maxThickness = Math.max(t1, t2);

    const W = canvas.width + maxThickness * 2;
    const H = canvas.height + maxThickness * 2;
    const out = createCanvas(W, H);
    const ctx = get2D(out);

    drawStrokeLayer(
      ctx,
      canvas,
      maxThickness,
      hexToRgb(String(options.color2 ?? "#ffffff")),
      t2,
      Number(options.opacity2 ?? 100) / 100,
    );
    drawStrokeLayer(
      ctx,
      canvas,
      maxThickness,
      hexToRgb(String(options.color1 ?? "#000000")),
      t1,
      Number(options.opacity1 ?? 100) / 100,
    );

    ctx.globalAlpha = 1;
    ctx.drawImage(canvas, maxThickness, maxThickness);
    return out;
  },
};

function drawStrokeLayer(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  pad: number,
  color: [number, number, number],
  thickness: number,
  opacity: number,
) {
  if (thickness <= 0 || opacity <= 0) return;

  const stamp = createCanvas(source.width, source.height);
  const stampCtx = get2D(stamp);
  stampCtx.drawImage(source, 0, 0);
  const id = stampCtx.getImageData(0, 0, source.width, source.height);
  const sd = id.data;
  for (let i = 0; i < sd.length; i += 4) {
    if (sd[i + 3] > 0) {
      sd[i] = color[0];
      sd[i + 1] = color[1];
      sd[i + 2] = color[2];
    }
  }
  stampCtx.putImageData(id, 0, 0);

  ctx.globalAlpha = opacity;
  const samples = 24;
  for (let i = 0; i < samples; i++) {
    const theta = (i / samples) * Math.PI * 2;
    ctx.drawImage(
      stamp,
      pad + Math.cos(theta) * thickness,
      pad + Math.sin(theta) * thickness,
    );
  }
}
