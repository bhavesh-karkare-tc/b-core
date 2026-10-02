import { homeNav, modules, settingsNav } from "@/modules";
import { NavLink } from "./nav-link";

/** Full B-Core navigation: Home, each module's tabs, Settings. Used by Sidebar and the mobile menu. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-1.5">
      <NavLink item={homeNav} onNavigate={onNavigate} />
      {modules.map((module) => (
        <div key={module.id} className="flex flex-col gap-1.5">
          <p className="px-3 pt-3.5 pb-1.5 font-mono text-[11px] tracking-[0.18em] text-text-faint uppercase">
            {module.label}
          </p>
          {module.tabs.map((tab) => (
            <NavLink key={tab.href} item={tab} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
      <div className="flex-1" />
      <NavLink item={settingsNav} onNavigate={onNavigate} />
      <p className="mt-3 rounded-control border border-dashed border-line-strong p-3 text-xs text-text-faint">
        More B-Core modules coming soon
      </p>
    </nav>
  );
}
