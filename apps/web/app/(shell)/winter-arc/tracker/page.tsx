import type { Metadata } from "next";
import { TrackerScreen } from "@/features/winter-arc/tracker/tracker-screen";

export const metadata: Metadata = { title: "Tracker" };

export default function TrackerPage() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <TrackerScreen />
    </div>
  );
}
