import { Settings } from "lucide-react";
import type { Metadata } from "next";
import { EmptyPage } from "@/components/shell/empty-page";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Arc settings" };

export default function ArcSettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Winter Arc" title="Arc settings" />
      <EmptyPage
        icon={Settings}
        title="Arc settings coming soon"
        description="Habits, notifications and the option to abandon this arc."
      />
    </>
  );
}
