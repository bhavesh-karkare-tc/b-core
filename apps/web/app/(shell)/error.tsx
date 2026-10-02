"use client";

import { Button } from "@b-core/ui/components/button";
import { TriangleAlert } from "lucide-react";
import { EmptyPage } from "@/components/shell/empty-page";

export default function ShellError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <EmptyPage
        icon={TriangleAlert}
        title="Something went wrong"
        description="This page could not load. Your data is safe. Try again."
      >
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
      </EmptyPage>
    </div>
  );
}
