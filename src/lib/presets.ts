"use client";

import type { PipelineStep } from "./plugins/types";

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

export function addPreset(name: string, pipeline: PipelineStep[]): Preset {
  const presets = loadPresets();
  const preset: Preset = {
    id: `preset-${Date.now()}`,
    name,
    pipeline: pipeline.map((s) => ({ ...s })),
    createdAt: Date.now(),
  };
  presets.push(preset);
  savePresets(presets);
  return preset;
}

export function deletePreset(id: string): void {
  const presets = loadPresets().filter((p) => p.id !== id);
  savePresets(presets);
}
