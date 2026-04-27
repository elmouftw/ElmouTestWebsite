"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { listPlugins, getPlugin } from "@/lib/plugins/registry";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PluginFieldControl } from "./plugin-field";

export function PipelinePanel() {
  const pipeline = useEditorStore((s) => s.pipeline);
  const addStep = useEditorStore((s) => s.addStep);
  const removeStep = useEditorStore((s) => s.removeStep);
  const toggleStep = useEditorStore((s) => s.toggleStep);
  const moveStep = useEditorStore((s) => s.moveStep);
  const updateStepOptions = useEditorStore((s) => s.updateStepOptions);
  const clearPipeline = useEditorStore((s) => s.clearPipeline);

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-sm font-semibold">Pipeline</h2>
        <div className="flex items-center gap-1">
          {pipeline.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={clearPipeline}
            >
              Clear
            </Button>
          )}
          <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="h-7 gap-1 px-2 text-xs">
                <Plus className="size-3.5" /> Add plugin
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[380px] sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Add a plugin</SheetTitle>
                <SheetDescription>
                  Plugins run in the order they appear. You can toggle, reorder
                  or remove them at any time.
                </SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-4">
                {listPlugins().map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      addStep(p.id);
                      setPickerOpen(false);
                    }}
                    className="flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-left text-sm transition-colors hover:border-foreground/30"
                  >
                    <span className="text-xl" aria-hidden>
                      {p.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {p.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {pipeline.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            No plugins added. Click <span className="font-medium">Add plugin</span> to start building your pipeline.
          </div>
        ) : (
          <ol className="space-y-2">
            {pipeline.map((step, idx) => {
              const plugin = getPlugin(step.pluginId);
              if (!plugin) return null;
              return (
                <li
                  key={step.stepId}
                  className={cn(
                    "rounded-lg border bg-card",
                    !step.enabled && "opacity-60",
                  )}
                >
                  <div className="flex items-center gap-2 border-b px-3 py-2">
                    <span className="text-base" aria-hidden>
                      {plugin.icon}
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {plugin.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => moveStep(step.stepId, -1)}
                      disabled={idx === 0}
                      aria-label="Move up"
                    >
                      <ChevronUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => moveStep(step.stepId, 1)}
                      disabled={idx === pipeline.length - 1}
                      aria-label="Move down"
                    >
                      <ChevronDown className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => toggleStep(step.stepId)}
                      aria-label={step.enabled ? "Disable" : "Enable"}
                    >
                      {step.enabled ? (
                        <Eye className="size-3.5" />
                      ) : (
                        <EyeOff className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => removeStep(step.stepId)}
                      aria-label="Remove"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-3 p-3">
                    {plugin.fields.map((field) => (
                      <PluginFieldControl
                        key={field.key}
                        field={field}
                        value={step.options[field.key]}
                        onChange={(key, value) =>
                          updateStepOptions(step.stepId, { [key]: value })
                        }
                      />
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
