/**
 * Small canvas helpers used by every plugin. Keeping these in one file means
 * each plugin can stay focused on its actual transformation logic.
 */

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(width));
  c.height = Math.max(1, Math.round(height));
  return c;
}

export function get2D(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Failed to acquire 2D canvas context");
  return ctx;
}

export function cloneCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const out = createCanvas(src.width, src.height);
  get2D(out).drawImage(src, 0, 0);
  return out;
}

export async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const c = createCanvas(bitmap.width, bitmap.height);
  get2D(c).drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return c;
}

export async function urlToCanvas(url: string): Promise<HTMLCanvasElement> {
  const res = await fetch(url);
  const blob = await res.blob();
  const bitmap = await createImageBitmap(blob);
  const c = createCanvas(bitmap.width, bitmap.height);
  get2D(c).drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return c;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob returned null"))),
      type,
      quality,
    );
  });
}

export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg" | "image/webp" = "image/png",
  quality = 0.92,
): string {
  return canvas.toDataURL(type, quality);
}

/** Hex (#rrggbb) → [r,g,b]. Tolerant of #rgb and uppercase. */
export function hexToRgb(hex: string): [number, number, number] {
  const m = hex.trim().replace(/^#/, "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return [0, 0, 0];
  const num = parseInt(full, 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

/** Color distance squared (RGB cube). Good enough for pixel-level diffs. */
export function colorDistSq(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return dr * dr + dg * dg + db * db;
}
