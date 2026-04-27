"use client";

import { useCallback } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PluginField, PluginOptions } from "@/lib/plugins/types";

interface Props {
  field: PluginField;
  value: PluginOptions[string];
  onChange: (key: string, value: PluginOptions[string]) => void;
}

export function PluginFieldControl({ field, value, onChange }: Props) {
  const id = `field-${field.key}`;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      onChange(field.key, url);
    },
    [field.key, onChange],
  );

  if (field.type === "checkbox") {
    return (
      <label
        htmlFor={id}
        className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm"
      >
        <span>
          <span className="block font-medium">{field.label}</span>
          {field.description && (
            <span className="block text-xs text-muted-foreground">
              {field.description}
            </span>
          )}
        </span>
        <Switch
          id={id}
          checked={Boolean(value)}
          onCheckedChange={(v) => onChange(field.key, v)}
        />
      </label>
    );
  }

  if (field.type === "color") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{field.label}</Label>
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="color"
            className="size-9 cursor-pointer rounded border bg-background"
            value={String(value ?? field.default)}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
          <Input
            value={String(value ?? field.default)}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="font-mono"
          />
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{field.label}</Label>
        <Select
          value={String(value ?? field.default)}
          onValueChange={(v) => onChange(field.key, v)}
        >
          <SelectTrigger id={id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (field.type === "slider") {
    const numeric = Number(value ?? field.default);
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <Label htmlFor={id}>{field.label}</Label>
          <span className="font-mono text-xs text-muted-foreground">
            {numeric}
            {field.unit ?? ""}
          </span>
        </div>
        <Slider
          id={id}
          min={field.min}
          max={field.max}
          step={field.step}
          value={[numeric]}
          onValueChange={([v]) => onChange(field.key, v)}
        />
      </div>
    );
  }

  if (field.type === "file") {
    const hasFile = Boolean(value);
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{field.label}</Label>
        {field.description && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed bg-muted/30 px-3 py-2 text-xs transition-colors hover:bg-muted/50"
        >
          <Upload className="size-3.5 shrink-0" />
          <span className="truncate text-muted-foreground">
            {hasFile ? "Image selected — click to change" : "Click to upload image"}
          </span>
          <input
            id={id}
            type="file"
            accept={field.accept ?? "image/*"}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    );
  }

  if (field.type === "text") {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{field.label}</Label>
        <Input
          id={id}
          type="text"
          value={String(value ?? field.default)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      </div>
    );
  }

  // number
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{field.label}</Label>
      <Input
        id={id}
        type="number"
        value={String(value ?? field.default)}
        min={field.min}
        max={field.max}
        step={field.step}
        onChange={(e) => onChange(field.key, Number(e.target.value))}
      />
    </div>
  );
}
