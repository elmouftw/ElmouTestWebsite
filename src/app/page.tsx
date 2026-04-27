import { SiteHeader } from "@/components/layout/site-header";
import { EditorShell } from "@/components/editor/editor-shell";

export const metadata = {
  title: "PixlForge — Editor",
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <EditorShell />
    </>
  );
}
