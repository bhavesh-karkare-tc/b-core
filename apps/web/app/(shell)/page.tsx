import { Button } from "@b-core/ui/components/button";
import { Card, CardDescription, CardLabel, CardTitle } from "@b-core/ui/components/card";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";

export default function HomePage() {
  return (
    <>
      <PageHeader eyebrow="B-Core" title="Home" />
      <Card className="max-w-md">
        <CardLabel>Module</CardLabel>
        <CardTitle>Winter Arc</CardTitle>
        <CardDescription>92 days. 10 habits. Never miss two.</CardDescription>
        <Button asChild className="self-start">
          <Link href="/winter-arc/today">Open Winter Arc</Link>
        </Button>
      </Card>
    </>
  );
}
