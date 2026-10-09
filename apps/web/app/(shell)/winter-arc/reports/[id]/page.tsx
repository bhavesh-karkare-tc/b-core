import type { Metadata } from "next";
import { ReportScreen } from "@/features/winter-arc/reports/report-screen";

export const metadata: Metadata = { title: "Report" };

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-2xl lg:max-w-6xl">
      <ReportScreen id={id} />
    </div>
  );
}
