"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { shortDate } from "../lib/format";
import { useThemeColors } from "../lib/use-theme-colors";

type Props = {
  values: { date: string; value: number | null }[];
  target: number;
  minimum: number | null;
  unit: string;
};

const fmt = new Intl.NumberFormat("en-US");

/** Count habit: daily value against the target (one series, labelled reference lines, table view). */
export function CountChart({ values, target, minimum, unit }: Props) {
  const colors = useThemeColors();
  if (values.length === 0)
    return <p className="py-6 text-center text-sm text-text-muted">No days in this chapter yet.</p>;
  // Clean y-axis: four steps of a round size (e.g. 0 / 1k / 2k / 3k / 4k).
  const max = Math.max(target, ...values.map((v) => v.value ?? 0));
  const raw = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * magnitude >= raw) ?? 10) * magnitude;
  const ticks = Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-ember" aria-hidden="true" />
          Target {fmt.format(target)} {unit}
        </span>
        {minimum !== null ? (
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed border-text-faint" aria-hidden="true" />
            Minimum {fmt.format(minimum)}
          </span>
        ) : null}
      </p>
      <div className="h-44" aria-hidden="true">
        {colors ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={values} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
              <CartesianGrid vertical={false} stroke={colors.line} />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) => String(Number(d.slice(8)))}
                tick={{ fill: colors["text-faint"], fontSize: 10 }}
                axisLine={{ stroke: colors.line }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, ticks.at(-1) ?? max]}
                ticks={ticks}
                tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                tick={{ fill: colors["text-faint"], fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine y={target} stroke={colors.ember} strokeDasharray="6 6" />
              {minimum !== null ? (
                <ReferenceLine y={minimum} stroke={colors["text-faint"]} strokeDasharray="4 4" />
              ) : null}
              <Tooltip
                cursor={{ fill: colors["surface-2"] }}
                isAnimationActive={false}
                content={({ active, payload }) => {
                  const p = payload?.[0]?.payload as
                    { date: string; value: number | null } | undefined;
                  if (!active || !p) return null;
                  return (
                    <div className="rounded-control border border-line-strong bg-surface-2 px-3 py-2 text-xs shadow-lg">
                      <strong className="font-mono text-sm text-text">
                        {p.value === null ? "—" : fmt.format(p.value)}
                      </strong>{" "}
                      <span className="text-text-muted">
                        {unit} · {shortDate(p.date)}
                      </span>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="value"
                fill={colors.accent}
                maxBarSize={16}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <details className="text-sm">
        <summary className="inline-flex min-h-tap cursor-pointer items-center text-accent">
          View as table
        </summary>
        <table className="w-full text-left font-mono text-xs tabular-nums">
          <tbody>
            {values.map((v) => (
              <tr key={v.date} className="border-t border-line">
                <td className="py-1">{shortDate(v.date)}</td>
                <td className="py-1 text-right">
                  {v.value === null ? "—" : `${fmt.format(v.value)} ${unit}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
