import type { PluginDefinition } from "./types";
import { trimPlugin } from "./trim";
import { paddingPlugin } from "./padding";
import { backgroundColorPlugin } from "./background-color";
import { solidColorPlugin } from "./solid-color";
import { imageAdjustmentsPlugin } from "./image-adjustments";

/**
 * Central plugin registry. Each PR adds entries here so the editor UI
 * automatically picks them up without further wiring.
 */
const ALL_PLUGINS: PluginDefinition[] = [
  trimPlugin,
  paddingPlugin,
  backgroundColorPlugin,
  solidColorPlugin,
  imageAdjustmentsPlugin,
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
