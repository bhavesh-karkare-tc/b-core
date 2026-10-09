import type { Metadata } from "next";
import { TodayScreen } from "@/features/winter-arc/today/today-screen";

export const metadata: Metadata = { title: "Today" };

export default function TodayPage() {
  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-6xl">
      <TodayScreen />
    </div>
  );
}
