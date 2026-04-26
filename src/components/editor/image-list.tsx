"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ImageList() {
  const images = useEditorStore((s) => s.images);
  const selectedImageId = useEditorStore((s) => s.selectedImageId);
  const selectImage = useEditorStore((s) => s.selectImage);
  const removeImage = useEditorStore((s) => s.removeImage);

  if (images.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
        No images yet. Add some above to get started.
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {images.map((img) => {
        const isSelected = img.id === selectedImageId;
        return (
          <li
            key={img.id}
            className={cn(
              "group flex items-center gap-2 rounded-md p-1.5 text-left text-xs transition-colors",
              isSelected ? "bg-muted" : "hover:bg-muted/60",
            )}
          >
            <button
              type="button"
              onClick={() => selectImage(img.id)}
              className="flex flex-1 items-center gap-2 text-left"
            >
              <span className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-checker">
                <Image
                  src={img.processedSrc ?? img.src}
                  alt={img.name}
                  fill
                  sizes="40px"
                  className="object-contain"
                  unoptimized
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">
                  {img.name}
                </span>
                <span className="block text-muted-foreground">
                  {img.width}×{img.height} ·{" "}
                  {img.status === "processing"
                    ? "processing…"
                    : img.status === "error"
                      ? "error"
                      : `${(img.size / 1024).toFixed(0)} KB`}
                </span>
              </span>
            </button>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeImage(img.id)}
              aria-label={`Remove ${img.name}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
