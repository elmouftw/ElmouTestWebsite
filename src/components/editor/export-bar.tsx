"use client";

import { useState } from "react";
import { Download, Package } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { runPipeline } from "@/lib/image/pipeline";
import { useEditorStore, type ExportFormat } from "@/lib/store";

const FORMAT_LABELS: Record<ExportFormat, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WEBP",
};

const FORMAT_EXT: Record<ExportFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function ExportBar() {
  const images = useEditorStore((s) => s.images);
  const pipeline = useEditorStore((s) => s.pipeline);
  const exportFormat = useEditorStore((s) => s.exportFormat);
  const setExportFormat = useEditorStore((s) => s.setExportFormat);
  const selectedImageId = useEditorStore((s) => s.selectedImageId);
  const exportQuality = useEditorStore((s) => s.exportQuality);

  const [busy, setBusy] = useState(false);
  const selected = images.find((i) => i.id === selectedImageId) ?? null;

  async function exportSelected() {
    if (!selected) return;
    setBusy(true);
    try {
      const blob = await runPipeline(
        selected.src,
        pipeline,
        exportFormat,
        exportQuality,
      );
      saveAs(blob, suggestName(selected.name, exportFormat));
      toast.success("Image exported");
    } catch (err) {
      toast.error(`Export failed: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  async function exportAll() {
    if (images.length === 0) return;
    setBusy(true);
    const zip = new JSZip();
    let failed = 0;
    try {
      for (const img of images) {
        try {
          const blob = await runPipeline(
            img.src,
            pipeline,
            exportFormat,
            exportQuality,
          );
          zip.file(suggestName(img.name, exportFormat), blob);
        } catch {
          failed += 1;
        }
      }
      const out = await zip.generateAsync({ type: "blob" });
      saveAs(out, `pixlforge-export-${Date.now()}.zip`);
      if (failed > 0) {
        toast.warning(`Exported ${images.length - failed}/${images.length} images`);
      } else {
        toast.success(`Exported ${images.length} images as zip`);
      }
    } catch (err) {
      toast.error(`Export failed: ${(err as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t bg-background px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">Export</span>
      <Select
        value={exportFormat}
        onValueChange={(v) => setExportFormat(v as ExportFormat)}
      >
        <SelectTrigger className="h-8 w-[110px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((k) => (
            <SelectItem key={k} value={k}>
              {FORMAT_LABELS[k]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={exportSelected}
          disabled={!selected || busy}
        >
          <Download className="size-3.5" />
          Export current
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={exportAll}
          disabled={images.length === 0 || busy}
        >
          <Package className="size-3.5" />
          Export all ({images.length})
        </Button>
      </div>
    </div>
  );
}

function suggestName(originalName: string, format: ExportFormat): string {
  const dot = originalName.lastIndexOf(".");
  const base = dot > 0 ? originalName.slice(0, dot) : originalName;
  return `${base}-pixlforge.${FORMAT_EXT[format]}`;
}
