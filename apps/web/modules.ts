/**
 * B-Core module registry: plain navigation data for the shell.
 * The shell reads this file and never imports from `features/*` (CLAUDE.md rule 4).
 */

export type NavIconName = "home" | "today" | "tracker" | "dashboard" | "reports" | "settings";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIconName;
};

export type ModuleNav = {
  id: string;
  label: string;
  basePath: string;
  /** Primary tabs: sidebar section on web, bottom tabs on mobile. */
  tabs: NavItem[];
  settings: NavItem;
};

export const homeNav: NavItem = { href: "/", label: "Home", icon: "home" };
export const settingsNav: NavItem = { href: "/settings", label: "Settings", icon: "settings" };

export const modules: ModuleNav[] = [
  {
    id: "winter-arc",
    label: "Winter Arc",
    basePath: "/winter-arc",
    tabs: [
      { href: "/winter-arc/today", label: "Today", icon: "today" },
      { href: "/winter-arc/tracker", label: "Tracker", icon: "tracker" },
      { href: "/winter-arc/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/winter-arc/reports", label: "Reports", icon: "reports" },
    ],
    settings: { href: "/winter-arc/settings", label: "Arc settings", icon: "settings" },
  },
];

/** True when `href` is the current page or one of its sub-pages. Home only matches exactly. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The module whose base path contains `pathname`, if any. */
export function findActiveModule(pathname: string): ModuleNav | undefined {
  return modules.find((m) => isActivePath(pathname, m.basePath));
}
