"use client";

import type { PipelineStep, PluginOptions } from "./plugins/types";

export interface Preset {
  id: string;
  name: string;
  pipeline: PipelineStep[];
  createdAt: number;
}

const STORAGE_KEY = "pixlforge-presets";

export function loadPresets(): Preset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Preset[];
  } catch {
    return [];
  }
}

export function savePresets(presets: Preset[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Storage full — silently ignore
  }
}

function stripBlobUrls(options: PluginOptions): {
  cleaned: PluginOptions;
  hadBlobs: boolean;
} {
  let hadBlobs = false;
  const cleaned: PluginOptions = {};
  for (const [key, val] of Object.entries(options)) {
    if (typeof val === "string" && val.startsWith("blob:")) {
      cleaned[key] = "";
      hadBlobs = true;
    } else {
      cleaned[key] = val;
    }
  }
  return { cleaned, hadBlobs };
}

export function addPreset(
  name: string,
  pipeline: PipelineStep[],
): { preset: Preset; hadBlobUrls: boolean } {
  const presets = loadPresets();
  let hadBlobUrls = false;

  const sanitizedPipeline = pipeline.map((s) => {
    const { cleaned, hadBlobs } = stripBlobUrls(s.options);
    if (hadBlobs) hadBlobUrls = true;
    return { ...s, options: cleaned };
  });

  const preset: Preset = {
    id: `preset-${Date.now()}`,
    name,
    pipeline: sanitizedPipeline,
    createdAt: Date.now(),
  };
  presets.push(preset);
  savePresets(presets);
  return { preset, hadBlobUrls };
}

export function deletePreset(id: string): void {
  const presets = loadPresets().filter((p) => p.id !== id);
  savePresets(presets);
}
