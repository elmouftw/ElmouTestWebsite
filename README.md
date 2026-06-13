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

## Roadmap

PR-by-PR rollout of the remaining ReadyPixl plugins:

- [x] Trim, Padding, Background Color, Solid Color, Image Adjustments
- [ ] Color Removal, Transparency Cleaner, Speckle Remover
- [ ] Distress, Clipping Mask
- [ ] Strokes, Strokes Advanced
- [ ] Reposition (canvas resize / image alignment)
- [ ] Upscaler 2x/4x (Real-ESRGAN via onnxruntime-web, with bicubic fallback)
- [ ] Upscaler 8x/16x

## License

MIT
