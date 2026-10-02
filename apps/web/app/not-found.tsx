import { Button } from "@b-core/ui/components/button";
import { Compass } from "lucide-react";
import Link from "next/link";
import { EmptyPage } from "@/components/shell/empty-page";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4">
      <EmptyPage icon={Compass} title="Page not found" description="That page does not exist.">
        <Button asChild variant="secondary">
          <Link href="/">Back to Home</Link>
        </Button>
      </EmptyPage>
    </main>
  );
}
