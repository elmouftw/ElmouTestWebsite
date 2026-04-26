"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  defaultOptionsFor,
  type PipelineStep,
  type PluginOptions,
} from "./plugins/types";
import { getPlugin } from "./plugins/registry";

export interface SourceImage {
  id: string;
  name: string;
  type: string;
  size: number;
  /** Object URL for the original file. */
  src: string;
  width: number;
  height: number;
  /**
   * Cached object URL of the latest processed result. May be `null` while
   * the pipeline is recomputing or before any processing has finished.
   */
  processedSrc: string | null;
  status: "idle" | "processing" | "done" | "error";
  errorMessage?: string;
}

export type ExportFormat = "image/png" | "image/jpeg" | "image/webp";

interface EditorState {
  images: SourceImage[];
  selectedImageId: string | null;
  pipeline: PipelineStep[];
  exportFormat: ExportFormat;
  exportQuality: number;

  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  selectImage: (id: string | null) => void;
  setProcessed: (
    id: string,
    update: Partial<Pick<SourceImage, "processedSrc" | "status" | "errorMessage">>,
  ) => void;

  addStep: (pluginId: string) => void;
  removeStep: (stepId: string) => void;
  toggleStep: (stepId: string) => void;
  moveStep: (stepId: string, direction: -1 | 1) => void;
  updateStepOptions: (stepId: string, options: PluginOptions) => void;
  clearPipeline: () => void;

  setExportFormat: (f: ExportFormat) => void;
  setExportQuality: (q: number) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  images: [],
  selectedImageId: null,
  pipeline: [],
  exportFormat: "image/png",
  exportQuality: 0.92,

  addImages: async (files) => {
    const additions: SourceImage[] = [];
    for (const file of files) {
      try {
        const src = URL.createObjectURL(file);
        const dims = await readImageDimensions(src);
        additions.push({
          id: nanoid(),
          name: file.name,
          type: file.type,
          size: file.size,
          src,
          width: dims.w,
          height: dims.h,
          processedSrc: null,
          status: "idle",
        });
      } catch {
        // Skip bad files silently; user will notice missing entries.
      }
    }
    if (additions.length === 0) return;
    set((s) => ({
      images: [...s.images, ...additions],
      selectedImageId: s.selectedImageId ?? additions[0].id,
    }));
  },

  removeImage: (id) => {
    set((s) => {
      const removed = s.images.find((i) => i.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.src);
        if (removed.processedSrc) URL.revokeObjectURL(removed.processedSrc);
      }
      const images = s.images.filter((i) => i.id !== id);
      const selectedImageId =
        s.selectedImageId === id
          ? (images[0]?.id ?? null)
          : s.selectedImageId;
      return { images, selectedImageId };
    });
  },

  selectImage: (id) => set({ selectedImageId: id }),

  setProcessed: (id, update) =>
    set((s) => {
      const images = s.images.map((img) => {
        if (img.id !== id) return img;
        if (
          update.processedSrc &&
          img.processedSrc &&
          update.processedSrc !== img.processedSrc
        ) {
          URL.revokeObjectURL(img.processedSrc);
        }
        return { ...img, ...update };
      });
      return { images };
    }),

  addStep: (pluginId) => {
    const plugin = getPlugin(pluginId);
    if (!plugin) return;
    const step: PipelineStep = {
      stepId: nanoid(),
      pluginId,
      enabled: true,
      options: defaultOptionsFor(plugin),
    };
    set((s) => ({ pipeline: [...s.pipeline, step] }));
  },

  removeStep: (stepId) =>
    set((s) => ({ pipeline: s.pipeline.filter((p) => p.stepId !== stepId) })),

  toggleStep: (stepId) =>
    set((s) => ({
      pipeline: s.pipeline.map((p) =>
        p.stepId === stepId ? { ...p, enabled: !p.enabled } : p,
      ),
    })),

  moveStep: (stepId, direction) => {
    const { pipeline } = get();
    const idx = pipeline.findIndex((p) => p.stepId === stepId);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= pipeline.length) return;
    const next = [...pipeline];
    [next[idx], next[target]] = [next[target], next[idx]];
    set({ pipeline: next });
  },

  updateStepOptions: (stepId, options) =>
    set((s) => ({
      pipeline: s.pipeline.map((p) =>
        p.stepId === stepId ? { ...p, options: { ...p.options, ...options } } : p,
      ),
    })),

  clearPipeline: () => set({ pipeline: [] }),

  setExportFormat: (exportFormat) => set({ exportFormat }),
  setExportQuality: (exportQuality) => set({ exportQuality }),
}));

function readImageDimensions(src: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => reject(new Error("Failed to read image dimensions"));
    img.src = src;
  });
}
