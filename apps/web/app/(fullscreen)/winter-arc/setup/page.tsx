import type { Metadata } from "next";
import { SetupFlow } from "@/features/winter-arc/setup/setup-flow";

export const metadata: Metadata = { title: "Set up your arc" };

export default function SetupPage() {
  return <SetupFlow />;
}
