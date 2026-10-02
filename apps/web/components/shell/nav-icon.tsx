import {
  ChartColumn,
  CircleDot,
  FileText,
  House,
  LayoutGrid,
  Settings,
  type LucideProps,
} from "lucide-react";
import type { NavIconName } from "@/modules";

const icons = {
  home: House,
  today: CircleDot,
  tracker: LayoutGrid,
  dashboard: ChartColumn,
  reports: FileText,
  settings: Settings,
} satisfies Record<NavIconName, unknown>;

export function NavIcon({ name, ...props }: LucideProps & { name: NavIconName }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" {...props} />;
}
