"use client";

import { ImageUploader } from "./image-uploader";
import { ImageList } from "./image-list";
import { Preview } from "./preview";
import { PipelinePanel } from "./pipeline-panel";
import { ExportBar } from "./export-bar";
import { usePipelineRunner } from "./use-pipeline-runner";

export function EditorShell() {
  usePipelineRunner();
  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 gap-0 lg:grid-cols-[280px_1fr_360px]">
      <aside className="flex h-full min-h-0 flex-col gap-3 border-b p-3 lg:border-b-0 lg:border-r">
        <h2 className="text-sm font-semibold">Images</h2>
        <ImageUploader compact />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ImageList />
        </div>
      </aside>

      <section className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 p-3">
          <Preview />
        </div>
        <ExportBar />
      </section>

      <aside className="h-full min-h-0 border-t lg:border-l lg:border-t-0">
        <PipelinePanel />
      </aside>
    </div>
  );
}
