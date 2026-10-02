import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { ArcSettings } from "@/features/winter-arc/settings/arc-settings";
import { HabitSettings } from "@/features/winter-arc/settings/habit-settings";

export const metadata: Metadata = { title: "Arc settings" };

export default function ArcSettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <PageHeader eyebrow="Winter Arc" title="Arc settings" />
      <HabitSettings />
      <ArcSettings />
    </div>
  );
}
