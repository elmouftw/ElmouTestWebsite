"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ImageUploader({ compact = false }: { compact?: boolean }) {
  const addImages = useEditorStore((s) => s.addImages);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) void addImages(accepted);
    },
    [addImages],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
      "image/avif": [".avif"],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed text-center transition-colors",
        compact
          ? "gap-1 px-4 py-4 text-xs"
          : "gap-2 px-6 py-10 text-sm",
        isDragActive
          ? "border-foreground/40 bg-muted"
          : "border-border bg-muted/30 hover:bg-muted/50",
      )}
    >
      <input {...getInputProps()} />
      <Upload className={compact ? "size-4" : "size-6"} aria-hidden />
      {compact ? (
        <span className="text-muted-foreground">
          {isDragActive ? "Drop to add" : "Drop or click to add"}
        </span>
      ) : (
        <>
          <span className="font-medium">
            {isDragActive
              ? "Drop the images here"
              : "Drag & drop images or click to browse"}
          </span>
          <span className="text-xs text-muted-foreground">
            PNG · JPG · WEBP · GIF · BMP · AVIF — processed locally
          </span>
        </>
      )}
    </div>
  );
}
