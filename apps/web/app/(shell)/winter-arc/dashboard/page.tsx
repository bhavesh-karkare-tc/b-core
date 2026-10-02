import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardScreen } from "@/features/winter-arc/dashboard/dashboard-screen";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-6xl">
      <Suspense>
        <DashboardScreen />
      </Suspense>
    </div>
  );
}
