import { Suspense, type ReactNode } from "react";
import { DemoPanel } from "@/features/winter-arc/dev/demo-panel";
import { DemoUrlLoader } from "@/features/winter-arc/dev/demo-url-loader";

export default function WinterArcLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <DemoPanel />
      <Suspense>
        <DemoUrlLoader />
      </Suspense>
    </>
  );
}
