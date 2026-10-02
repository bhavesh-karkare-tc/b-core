"use client";

import { cn } from "@b-core/ui/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { findActiveModule, isActivePath } from "@/modules";
import { NavIcon } from "./nav-icon";

/** Mobile bottom tabs (below lg) for the active module. Hidden outside a module. */
export function BottomTabs() {
  const pathname = usePathname();
  const activeModule = findActiveModule(pathname);
  if (!activeModule) return null;

  return (
    <nav
      aria-label={activeModule.label}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-bg px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      {activeModule.tabs.map((tab) => {
        const active = isActivePath(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-tap flex-col items-center justify-center gap-1 rounded-control text-[11px] transition-colors",
              active ? "font-semibold text-accent" : "text-text-faint hover:text-text-muted",
            )}
          >
            <NavIcon name={tab.icon} className="size-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
