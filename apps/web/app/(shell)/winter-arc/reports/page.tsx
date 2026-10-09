import type { Metadata } from "next";
import { ReportsScreen } from "@/features/winter-arc/reports/reports-screen";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl lg:max-w-6xl">
      <ReportsScreen />
    </div>
  );
}
