"use client";

import { nightMinutes } from "@b-core/arc-engine";
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatClock } from "@/data";
import { shortDate } from "../lib/format";
import { useThemeColors } from "../lib/use-theme-colors";

type Props = {
  times: { date: string; loggedTime: string | null }[];
  target: string;
  minimum: string | null;
};

/** "HH:mm" for a night-clock minute value (may exceed 24:00). */
function clockFromNight(m: number): string {
  const mins = ((m % 1440) + 1440) % 1440;
  return formatClock(
    `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`,
  );
}

/** Time habit: logged time per day vs target (night clock so 23:50 sits before 00:20). */
export function TimeChart({ times, target, minimum }: Props) {
  const colors = useThemeColors();
  const points = times.flatMap((t, i) =>
    t.loggedTime
      ? [{ day: i + 1, date: t.date, minutes: nightMinutes(t.loggedTime), logged: t.loggedTime }]
      : [],
  );
  if (points.length === 0)
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        No times logged in this chapter yet.
      </p>
    );
  const targetM = nightMinutes(target);
  const minM = minimum ? nightMinutes(minimum) : null;
  const all = [...points.map((p) => p.minutes), targetM, ...(minM === null ? [] : [minM])];
  // Whole-hour ticks around the data and both reference lines.
  const lo = Math.floor((Math.min(...all) - 15) / 60) * 60;
  const hi = Math.ceil((Math.max(...all) + 15) / 60) * 60;
  const ticks = Array.from({ length: (hi - lo) / 60 + 1 }, (_, i) => lo + i * 60);
  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-ember" aria-hidden="true" />
          Done by {formatClock(target)}
        </span>
        {minimum ? (
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed border-text-faint" aria-hidden="true" />
            Minimum by {formatClock(minimum)}
          </span>
        ) : null}
      </p>
      <div className="h-44" aria-hidden="true">
        {colors ? (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid vertical={false} stroke={colors.line} />
              <XAxis
                type="number"
                dataKey="day"
                domain={[0.5, times.length + 0.5]}
                tick={{ fill: colors["text-faint"], fontSize: 10 }}
                axisLine={{ stroke: colors.line }}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="number"
                dataKey="minutes"
                domain={[lo, hi]}
                ticks={ticks}
                reversed
                tickFormatter={clockFromNight}
                tick={{ fill: colors["text-faint"], fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <ReferenceLine y={targetM} stroke={colors.ember} strokeDasharray="6 6" />
              {minM !== null ? (
                <ReferenceLine y={minM} stroke={colors["text-faint"]} strokeDasharray="4 4" />
              ) : null}
              <Tooltip
                isAnimationActive={false}
                cursor={{ stroke: colors["text-muted"], strokeWidth: 1 }}
                content={({ active, payload }) => {
                  const p = payload?.[0]?.payload as (typeof points)[number] | undefined;
                  if (!active || !p) return null;
                  return (
                    <div className="rounded-control border border-line-strong bg-surface-2 px-3 py-2 text-xs shadow-lg">
                      <strong className="font-mono text-sm text-text">
                        {formatClock(p.logged)}
                      </strong>{" "}
                      <span className="text-text-muted">· {shortDate(p.date)}</span>
                    </div>
                  );
                }}
              />
              <Scatter
                data={points}
                fill={colors.accent}
                stroke={colors.surface}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <details className="text-sm">
        <summary className="inline-flex min-h-tap cursor-pointer items-center text-accent">
          View as table
        </summary>
        <table className="w-full text-left font-mono text-xs tabular-nums">
          <tbody>
            {times.map((t) => (
              <tr key={t.date} className="border-t border-line">
                <td className="py-1">{shortDate(t.date)}</td>
                <td className="py-1 text-right">
                  {t.loggedTime ? formatClock(t.loggedTime) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
