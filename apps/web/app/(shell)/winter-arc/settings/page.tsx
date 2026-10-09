import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { ArcSettings } from "@/features/winter-arc/settings/arc-settings";
import { HabitSettings } from "@/features/winter-arc/settings/habit-settings";
import { NotificationSettingsScreen } from "@/features/winter-arc/settings/notification-settings-screen";

export const metadata: Metadata = { title: "Arc settings" };

export default function ArcSettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 lg:max-w-6xl">
      <PageHeader eyebrow="Winter Arc" title="Arc settings" />
      {/* Web (W08): Arc settings and Notifications side by side. */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div className="flex flex-col gap-6">
          <HabitSettings />
          <ArcSettings />
        </div>
        <div className="hidden lg:block">
          <NotificationSettingsScreen embedded />
        </div>
      </div>
    </div>
  );
}
