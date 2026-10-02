import type { HabitRowView } from "@/data";

export type SheetBodyProps = {
  row: HabitRowView;
  date: string;
  /** Run a data mutation (errors surface on the screen), then refresh. */
  run: (mutation: () => Promise<unknown>) => Promise<void>;
  close: () => void;
};
