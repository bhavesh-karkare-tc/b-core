import { ChartColumn } from "lucide-react";
import type { Metadata } from "next";
import { EmptyPage } from "@/components/shell/empty-page";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader eyebrow="Winter Arc" title="Dashboard" />
      <EmptyPage
        icon={ChartColumn}
        title="No data yet"
        description="Where you stand, what is working and what to fix. Insights unlock after 7 days."
      />
    </>
  );
}
