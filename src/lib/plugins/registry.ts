import type { PluginDefinition } from "./types";
import { trimPlugin } from "./trim";
import { paddingPlugin } from "./padding";
import { backgroundColorPlugin } from "./background-color";
import { solidColorPlugin } from "./solid-color";
import { imageAdjustmentsPlugin } from "./image-adjustments";
import { colorRemovalPlugin } from "./color-removal";
import { resizePlugin } from "./resize";
import { repositionPlugin } from "./reposition";
import { cornerErasePlugin } from "./corner-erase";
import { speckleRemoverPlugin } from "./speckle-remover";
import { transparencyCleanerPlugin } from "./transparency-cleaner";
import { distressPlugin } from "./distress";
import { framesPlugin } from "./frames";
import { filtersPlugin } from "./filters";
import { rotateFlipPlugin } from "./rotate-flip";
import { watermarkTextPlugin } from "./watermark-text";
import { watermarkImagePlugin } from "./watermark-image";
import { clippingMaskPlugin } from "./clipping-mask";
import { upscalerPlugin } from "./upscaler";

/**
 * Central plugin registry. Each PR adds entries here so the editor UI
 * automatically picks them up without further wiring.
 */
const ALL_PLUGINS: PluginDefinition[] = [
  colorRemovalPlugin,
  resizePlugin,
  repositionPlugin,
  imageAdjustmentsPlugin,
  clippingMaskPlugin,
  trimPlugin,
  cornerErasePlugin,
  speckleRemoverPlugin,
  transparencyCleanerPlugin,
  distressPlugin,
  framesPlugin,
  filtersPlugin,
  rotateFlipPlugin,
  watermarkTextPlugin,
  watermarkImagePlugin,
  paddingPlugin,
  backgroundColorPlugin,
  solidColorPlugin,
  upscalerPlugin,
];

const BY_ID = new Map<string, PluginDefinition>(
  ALL_PLUGINS.map((p) => [p.id, p]),
);

export function listPlugins(): PluginDefinition[] {
  return ALL_PLUGINS;
}

export function getPlugin(id: string): PluginDefinition | undefined {
  return BY_ID.get(id);
}
