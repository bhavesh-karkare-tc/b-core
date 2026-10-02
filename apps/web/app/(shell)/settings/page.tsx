import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { EmptyPage } from "@/components/shell/empty-page";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="B-Core" title="Settings" />
      <EmptyPage
        icon={Settings}
        title="Settings coming soon"
        description="Account and app preferences for all B-Core modules."
      />
    </>
  );
}
