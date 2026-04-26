# PixlForge

A free, open-source bulk image processor that runs entirely in your browser. Drop in dozens of images, build a chainable plugin pipeline (Trim → Padding → Solid Color → Image Adjustments…) and export the whole batch as a zip — without any uploads.

> Inspired by the desktop app **ReadyPixl** but rebuilt from scratch as an MIT-licensed web app with original branding and code. No paid APIs, no signups, no telemetry.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS 4** + **shadcn/ui** (Radix primitives, Nova preset)
- **Zustand** for editor state
- **JSZip** + **file-saver** for batch export
- All image transformations run on `HTMLCanvasElement` 100% client-side

## Project layout

```
src/
  app/                  # Next.js App Router pages
    page.tsx            # landing
    app/page.tsx        # editor
    plugins/page.tsx    # plugin gallery
    download/page.tsx   # desktop placeholder
  components/
    layout/             # site header / footer
    editor/             # uploader, list, preview, pipeline, export bar
    ui/                 # shadcn primitives
  lib/
    image/              # canvas helpers + pipeline runner
    plugins/            # plugin registry + each plugin definition
    store.ts            # Zustand editor store
```

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Adding a plugin

1. Create `src/lib/plugins/my-plugin.ts` exporting a `PluginDefinition`.
2. Add it to the array in `src/lib/plugins/registry.ts`.
3. The editor UI and the plugin gallery pick it up automatically.

A plugin is a deterministic function `(canvas, options) => canvas`. Use the helpers in `src/lib/image/canvas.ts` to keep things consistent.

## Plugins shipped

- [x] Trim
- [x] Padding
- [x] Reposition (explicit canvas size + 9-anchor placement)
- [x] Clipping Mask (circle / ellipse / square / rounded rect)
- [x] Background Color
- [x] Solid Color
- [x] Color Removal (up to 3 targets, tolerance + edge feather)
- [x] Image Adjustments (brightness / contrast / saturation / hue / gamma / invert)
- [x] Transparency Cleaner
- [x] Speckle Remover
- [x] Distress
- [x] Strokes (configurable color / thickness / sample density)
- [x] Strokes Advanced (two stacked stroke layers)
- [x] Upscaler (1.5× / 2× / 3× / 4× / 8× / 16× with optional unsharp-mask)

## Roadmap

- [ ] Real-ESRGAN ONNX backend behind the existing Upscaler plugin id (free, in-browser)
- [ ] Web Worker pipeline runner for large batches
- [ ] Pipeline import/export as JSON for shareable presets

## License

MIT
