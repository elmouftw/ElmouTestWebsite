import type { PluginDefinition } from "./types";
import { trimPlugin } from "./trim";
import { paddingPlugin } from "./padding";
import { backgroundColorPlugin } from "./background-color";
import { solidColorPlugin } from "./solid-color";
import { imageAdjustmentsPlugin } from "./image-adjustments";
import { colorRemovalPlugin } from "./color-removal";
import { transparencyCleanerPlugin } from "./transparency-cleaner";
import { speckleRemoverPlugin } from "./speckle-remover";
import { distressPlugin } from "./distress";
import { clippingMaskPlugin } from "./clipping-mask";

/**
 * Central plugin registry. Each PR adds entries here so the editor UI
 * automatically picks them up without further wiring.
 */
const ALL_PLUGINS: PluginDefinition[] = [
  trimPlugin,
  paddingPlugin,
  clippingMaskPlugin,
  backgroundColorPlugin,
  solidColorPlugin,
  colorRemovalPlugin,
  imageAdjustmentsPlugin,
  transparencyCleanerPlugin,
  speckleRemoverPlugin,
  distressPlugin,
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
