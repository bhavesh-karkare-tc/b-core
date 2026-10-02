import type { ReactNode } from "react";
import { BottomTabs } from "./bottom-tabs";
import { MobileHeader } from "./mobile-header";
import { Sidebar } from "./sidebar";

/** B-Core shell: sidebar on web, top bar + bottom tabs on mobile. Module-agnostic. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-control bg-accent px-4 py-3 font-semibold text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main
          id="main"
          className="flex flex-1 flex-col gap-6 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:py-8 2xl:px-20"
        >
          {children}
        </main>
        <BottomTabs />
      </div>
    </div>
  );
}
