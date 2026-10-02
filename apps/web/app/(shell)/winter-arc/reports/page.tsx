import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { EmptyPage } from "@/components/shell/empty-page";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader eyebrow="Winter Arc" title="Reports" />
      <EmptyPage
        icon={FileText}
        title="No reports yet"
        description="Weekly summaries arrive every Monday at noon; monthly reviews on the 1st."
      />
    </>
  );
}
