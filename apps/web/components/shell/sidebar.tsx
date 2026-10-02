import { SidebarNav } from "./sidebar-nav";
import { Wordmark } from "./wordmark";

/** Web sidebar (lg and up): fixed 240px column. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-sidebar shrink-0 flex-col gap-3 overflow-y-auto border-r border-line bg-panel px-4 py-7 lg:flex">
      <Wordmark />
      <SidebarNav />
    </aside>
  );
}
