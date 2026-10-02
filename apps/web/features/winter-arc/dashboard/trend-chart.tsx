"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardView } from "@/data";
import { shortDate } from "../lib/format";
import { useThemeColors } from "../lib/use-theme-colors";

type Point = Extract<DashboardView, { kind: "dashboard" }>["trend"][number];

const tick = (date: string) =>
  `${Number(date.slice(8))} ${new Date(`${date}T00:00:00Z`).toLocaleString("en-US", { month: "short", timeZone: "UTC" })}`;
const round = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : String(Math.round(v));

type TooltipProps = { active?: boolean; payload?: readonly { payload?: unknown }[] };

function TrendTooltip({ active, payload }: TooltipProps) {
  const point = payload?.[0]?.payload as Point | undefined;
  if (!active || !point) return null;
  return (
    <div className="flex flex-col gap-1 rounded-control border border-line-strong bg-surface-2 px-3 py-2 text-xs shadow-lg">
      <span className="text-text-muted">{shortDate(point.date)}</span>
      <span className="flex items-center gap-2">
        <span className="h-0.5 w-3 rounded-full bg-accent" aria-hidden="true" />
        <strong className="font-mono text-sm text-text">
          {point.score === null ? "Sick" : round(point.score)}
        </strong>
        <span className="text-text-muted">score</span>
      </span>
      <span className="flex items-center gap-2">
        <span className="h-0.5 w-3 rounded-full bg-accent-3" aria-hidden="true" />
        <strong className="font-mono text-sm text-text">{round(point.average7)}</strong>
        <span className="text-text-muted">7-day avg</span>
      </span>
    </div>
  );
}

/**
 * Daily score with a 7-day average and the strong-day threshold (MASTER_DOC §10).
 * Two lines of one hue (validated as an ordinal pair), legend + end labels, crosshair tooltip,
 * and a table view so no value is gated behind hover.
 */
export function TrendChart({ points, threshold }: { points: Point[]; threshold: number }) {
  const colors = useThemeColors();
  const last = points.at(-1);
  if (points.length === 0) {
    return <p className="py-10 text-center text-sm text-text-muted">No days in this range yet.</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-4 text-xs text-text-muted" aria-label="Legend">
        <li className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-accent" aria-hidden="true" />
          Daily score{" "}
          {last ? <strong className="font-mono text-text">{round(last.score)}</strong> : null}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded-full bg-accent-3" aria-hidden="true" />
          7-day average{" "}
          {last ? <strong className="font-mono text-text">{round(last.average7)}</strong> : null}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-ember" aria-hidden="true" />
          Strong day at {threshold}
        </li>
      </ul>
      <div className="h-52" aria-hidden="true">
        {colors ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
              <CartesianGrid vertical={false} stroke={colors.line} strokeWidth={1} />
              <XAxis
                dataKey="date"
                tickFormatter={tick}
                tick={{ fill: colors["text-faint"], fontSize: 11 }}
                axisLine={{ stroke: colors.line }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tick={{ fill: colors["text-faint"], fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <ReferenceLine
                y={threshold}
                stroke={colors.ember}
                strokeDasharray="6 6"
                strokeWidth={1}
              />
              <Tooltip
                content={(props) => <TrendTooltip active={props.active} payload={props.payload} />}
                cursor={{ stroke: colors["text-muted"], strokeWidth: 1 }}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="average7"
                stroke={colors["accent-3"]}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: colors["accent-3"],
                  stroke: colors.surface,
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
                connectNulls
              />
              <Line
                type="linear"
                dataKey="score"
                stroke={colors.accent}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: colors.accent, stroke: colors.surface, strokeWidth: 2 }}
                isAnimationActive={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <details className="text-sm">
        <summary className="inline-flex min-h-tap cursor-pointer items-center text-accent">
          View as table
        </summary>
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-left font-mono text-xs tabular-nums">
            <thead className="text-text-faint">
              <tr>
                <th className="py-1 font-normal">Date</th>
                <th className="py-1 text-right font-normal">Score</th>
                <th className="py-1 text-right font-normal">7-day avg</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.date} className="border-t border-line">
                  <td className="py-1">{shortDate(p.date)}</td>
                  <td className="py-1 text-right">{p.score === null ? "Sick" : p.score}</td>
                  <td className="py-1 text-right">{round(p.average7)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
