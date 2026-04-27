"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Search,
  Save,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { listPlugins, getPlugin } from "@/lib/plugins/registry";
import { useEditorStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PluginFieldControl } from "./plugin-field";
import { addPreset, deletePreset, loadPresets, type Preset } from "@/lib/presets";
import { defaultOptionsFor } from "@/lib/plugins/types";

export function PipelinePanel() {
  const pipeline = useEditorStore((s) => s.pipeline);
  const addStep = useEditorStore((s) => s.addStep);
  const removeStep = useEditorStore((s) => s.removeStep);
  const toggleStep = useEditorStore((s) => s.toggleStep);
  const moveStep = useEditorStore((s) => s.moveStep);
  const updateStepOptions = useEditorStore((s) => s.updateStepOptions);
  const clearPipeline = useEditorStore((s) => s.clearPipeline);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetName, setPresetName] = useState("");

  const refreshPresets = useCallback(() => {
    setPresets(loadPresets());
  }, []);

  const allPlugins = useMemo(() => listPlugins(), []);

  const filteredPlugins = useMemo(() => {
    if (!searchQuery.trim()) return allPlugins;
    const q = searchQuery.toLowerCase();
    return allPlugins.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [allPlugins, searchQuery]);

  const handleSavePreset = useCallback(() => {
    const name = presetName.trim();
    if (!name) {
      toast.error("Please enter a preset name");
      return;
    }
    if (pipeline.length === 0) {
      toast.error("Pipeline is empty");
      return;
    }
    addPreset(name, pipeline);
    setPresetName("");
    setPresets(loadPresets());
    toast.success(`Preset "${name}" saved`);
  }, [presetName, pipeline]);

  const handleLoadPreset = useCallback(
    (preset: Preset) => {
      clearPipeline();
      for (const step of preset.pipeline) {
        const plugin = getPlugin(step.pluginId);
        if (plugin) {
          addStep(step.pluginId);
          const currentPipeline = useEditorStore.getState().pipeline;
          const lastStep = currentPipeline[currentPipeline.length - 1];
          if (lastStep) {
            const merged = { ...defaultOptionsFor(plugin), ...step.options };
            updateStepOptions(lastStep.stepId, merged);
            if (!step.enabled) {
              toggleStep(lastStep.stepId);
            }
          }
        }
      }
      setPresetsOpen(false);
      toast.success(`Preset "${preset.name}" loaded`);
    },
    [clearPipeline, addStep, updateStepOptions, toggleStep],
  );

  const handleDeletePreset = useCallback((id: string) => {
    deletePreset(id);
    setPresets(loadPresets());
    toast.success("Preset deleted");
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-sm font-semibold">Pipeline</h2>
        <div className="flex items-center gap-1">
          <Dialog open={presetsOpen} onOpenChange={(open) => { setPresetsOpen(open); if (open) refreshPresets(); }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                <FolderOpen className="size-3.5" />
                Presets
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Pipeline Presets</DialogTitle>
                <DialogDescription>
                  Save your current pipeline or load a saved preset.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Preset name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    className="text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
                  />
                  <Button
                    size="sm"
                    className="h-9 gap-1 shrink-0"
                    onClick={handleSavePreset}
                    disabled={pipeline.length === 0}
                  >
                    <Save className="size-3.5" />
                    Save
                  </Button>
                </div>
                {presets.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    No saved presets yet.
                  </p>
                ) : (
                  <ul className="max-h-60 space-y-1 overflow-y-auto">
                    {presets.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-2 rounded-md border p-2 text-xs"
                      >
                        <button
                          type="button"
                          className="flex-1 text-left font-medium hover:text-foreground"
                          onClick={() => handleLoadPreset(p)}
                        >
                          {p.name}
                          <span className="ml-1 text-muted-foreground">
                            ({p.pipeline.length} steps)
                          </span>
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-destructive"
                          onClick={() => handleDeletePreset(p.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DialogContent>
          </Dialog>
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
              <div className="mt-4 space-y-2 px-4 pb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search plugins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                  {filteredPlugins.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        addStep(p.id);
                        setPickerOpen(false);
                        setSearchQuery("");
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
                  {filteredPlugins.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      No plugins match &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}
                </div>
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
