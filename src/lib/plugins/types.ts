/**
 * Plugin contract for PixlForge.
 *
 * A plugin transforms an `ImageBitmap` (or `OffscreenCanvas`) into a new canvas
 * using a typed `options` object. Plugins are pure: same input + same options
 * = same output. They run entirely in the browser (Web Worker friendly) so the
 * core processing has no server dependency.
 */

export type PluginCategory =
  | "color"
  | "geometry"
  | "effect"
  | "cleanup"
  | "ai";

export type PluginFieldType =
  | "color"
  | "number"
  | "slider"
  | "checkbox"
  | "select";

export interface PluginFieldBase {
  key: string;
  label: string;
  description?: string;
}

export interface PluginColorField extends PluginFieldBase {
  type: "color";
  default: string;
}

export interface PluginNumberField extends PluginFieldBase {
  type: "number" | "slider";
  default: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface PluginCheckboxField extends PluginFieldBase {
  type: "checkbox";
  default: boolean;
}

export interface PluginSelectField extends PluginFieldBase {
  type: "select";
  default: string;
  options: { value: string; label: string }[];
}

export type PluginField =
  | PluginColorField
  | PluginNumberField
  | PluginCheckboxField
  | PluginSelectField;

export type PluginOptions = Record<string, string | number | boolean>;

export interface PluginContext {
  /**
   * The browser canvas API to use. We always run in a 2D context, on either
   * a regular HTMLCanvasElement (main thread) or an OffscreenCanvas (worker).
   */
  createCanvas: (width: number, height: number) => HTMLCanvasElement;
}

export interface PluginRunInput {
  canvas: HTMLCanvasElement;
  options: PluginOptions;
  ctx: PluginContext;
}

export interface PluginDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji for parity with ReadyPixl's plugin gallery look
  version: string;
  category: PluginCategory;
  fields: PluginField[];
  run: (input: PluginRunInput) => Promise<HTMLCanvasElement>;
}

export interface PipelineStep {
  /** Stable per-step UUID so reordering is cheap. */
  stepId: string;
  pluginId: string;
  enabled: boolean;
  options: PluginOptions;
}

export function defaultOptionsFor(plugin: PluginDefinition): PluginOptions {
  const out: PluginOptions = {};
  for (const f of plugin.fields) {
    out[f.key] = f.default;
  }
  return out;
}
