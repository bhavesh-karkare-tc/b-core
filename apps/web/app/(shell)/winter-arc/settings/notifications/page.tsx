import type { Metadata } from "next";
import { NotificationSettingsScreen } from "@/features/winter-arc/settings/notification-settings-screen";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <NotificationSettingsScreen />
    </div>
  );
}
