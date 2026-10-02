import { CircleDot } from "lucide-react";
import type { Metadata } from "next";
import { EmptyPage } from "@/components/shell/empty-page";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Today" };

export default function TodayPage() {
  return (
    <>
      <PageHeader eyebrow="Winter Arc" title="Today" />
      <EmptyPage
        icon={CircleDot}
        title="Nothing to log yet"
        description="Your habits, today's score and streak will appear here once your arc starts."
      />
    </>
  );
}
