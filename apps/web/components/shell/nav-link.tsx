"use client";

import { cn } from "@b-core/ui/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, type NavItem } from "@/modules";
import { NavIcon } from "./nav-icon";

type NavLinkProps = {
  item: NavItem;
  onNavigate?: () => void;
};

/** Sidebar row: icon + label, ≥44px tall, active state on surface-2. */
export function NavLink({ item, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href);

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "flex min-h-tap items-center gap-2.5 rounded-control px-3 text-sm transition-colors",
        active
          ? "bg-surface-2 font-semibold text-text"
          : "text-text-muted hover:bg-surface-2/60 hover:text-text",
      )}
    >
      <NavIcon name={item.icon} className={cn("size-[18px]", active && "text-accent")} />
      {item.label}
    </Link>
  );
}
