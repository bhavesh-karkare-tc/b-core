import { LayoutGrid } from "lucide-react";
import type { Metadata } from "next";
import { EmptyPage } from "@/components/shell/empty-page";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Tracker" };

export default function TrackerPage() {
  return (
    <>
      <PageHeader eyebrow="Winter Arc" title="Tracker" />
      <EmptyPage
        icon={LayoutGrid}
        title="Month grid coming soon"
        description="Every habit across every day of the chapter, with points and journal lines."
      />
    </>
  );
}
