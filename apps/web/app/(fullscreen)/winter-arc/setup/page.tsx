import { Button } from "@b-core/ui/components/button";
import { Flag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyPage } from "@/components/shell/empty-page";
import { PageHeader } from "@/components/shell/page-header";

export const metadata: Metadata = { title: "Set up your arc" };

export default function SetupPage() {
  return (
    <>
      <PageHeader eyebrow="Winter Arc · Setup" title="Start your arc" />
      <EmptyPage
        icon={Flag}
        title="Setup coming soon"
        description="92 days. 10 habits. Never miss two. The setup flow takes under 3 minutes."
      >
        <Button asChild variant="secondary">
          <Link href="/winter-arc/today">Back to Today</Link>
        </Button>
      </EmptyPage>
    </>
  );
}
