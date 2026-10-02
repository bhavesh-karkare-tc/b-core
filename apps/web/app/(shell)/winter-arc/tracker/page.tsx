import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackerSkeleton } from "@/features/winter-arc/tracker/tracker-skeleton";
import { TrackerScreen } from "@/features/winter-arc/tracker/tracker-screen";

export const metadata: Metadata = { title: "Tracker" };

export default function TrackerPage() {
  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-6xl">
      <Suspense fallback={<TrackerSkeleton />}>
        <TrackerScreen />
      </Suspense>
    </div>
  );
}
