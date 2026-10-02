"use client";

import { Button } from "@b-core/ui/components/button";
import { cn } from "@b-core/ui/lib/cn";
import { ChevronDown, Flag, Hourglass, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { EmptyPage } from "@/components/shell/empty-page";
import type { DashboardFilter } from "@/data";
import { DayDetailSheet } from "../day-detail/day-detail-sheet";
import { HabitDetailSheet } from "../habit-detail/habit-detail-sheet";
import { useMediaQuery } from "../lib/use-media-query";
import { FilterRow } from "./filter-row";
import { HabitBars } from "./habit-bars";
import { Heatmap } from "./heatmap";
import { BodyMetrics } from "./body-metrics";
import { CategoryBalance } from "./category-balance";
import { InsightsPanel } from "./insights-panel";
import { Panel } from "./panel";
import { RankCard } from "./rank-card";
import { StatTile } from "./stat-tile";
import { StreakCard } from "./streak-card";
import { TrendChart } from "./trend-chart";
import { useDashboard } from "./use-dashboard";

const fmt = new Intl.NumberFormat("en-US");
const avg = (v: number | null) => (v === null ? "—" : String(Math.round(v)));

/** Dashboard (MASTER_DOC §10): where am I, what is working, what to fix. */
export function DashboardScreen() {
  const wide = useMediaQuery("(min-width: 64rem)");
  const [chosen, setChosen] = useState<DashboardFilter | null>(null);
  // Mobile defaults to the current chapter, web to the whole arc.
  const filter: DashboardFilter = chosen ?? (wide ? { kind: "arc" } : { kind: "current" });
  const { state, reload } = useDashboard(filter.kind, filter.kind === "chapter" ? filter.index : 0);
  const [more, setMore] = useState(false);
  const [showAllHabits, setShowAllHabits] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const setParam = (key: "day" | "habit", value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("demo");
    const q = next.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };
  const openDay = params.get("day");
  const openHabit = params.get("habit");

  if (state.status === "loading") {
    return (
      <div
        className="h-[640px] animate-pulse rounded-card bg-surface"
        role="status"
        aria-label="Loading dashboard"
      />
    );
  }
  if (state.status === "error") {
    return (
      <div role="alert">
        <EmptyPage
          icon={TriangleAlert}
          title="Dashboard could not load"
          description={state.message}
        >
          <Button variant="secondary" onClick={() => void reload()}>
            Try again
          </Button>
        </EmptyPage>
      </div>
    );
  }
  const { view } = state;
  if (view.kind === "no_arc") {
    return (
      <EmptyPage icon={Flag} title="No arc yet" description="Your dashboard fills in as you log.">
        <Button asChild>
          <Link href="/winter-arc/setup">Start my arc</Link>
        </Button>
      </EmptyPage>
    );
  }
  if (view.kind === "countdown") {
    return (
      <EmptyPage
        icon={Hourglass}
        title={`Starts in ${view.daysUntilStart} ${view.daysUntilStart === 1 ? "day" : "days"}`}
        description="Your dashboard opens on Day 1."
      />
    );
  }

  const { tiles } = view;
  const scopeLabel =
    view.filter.kind === "arc"
      ? `Arc · ${view.arc.durationDays} days`
      : (view.chapters.find((c) => view.filter.kind === "chapter" && c.index === view.filter.index)
          ?.label ?? "");
  const threshold = view.arc.strongThreshold;

  const heatmap = (
    <Panel
      title={`${scopeLabel} heatmap`}
      action={
        <Link
          href="/winter-arc/tracker"
          className="inline-flex min-h-tap items-center text-[13px] text-accent"
        >
          Open tracker
        </Link>
      }
    >
      <Heatmap
        cells={view.heatmap}
        layout={view.filter.kind === "arc" ? "weeks" : "calendar"}
        onOpenDay={(d) => setParam("day", d)}
      />
    </Panel>
  );
  const habits = (
    <Panel title="Habit completion · weakest first">
      <HabitBars
        habits={view.habits}
        limit={wide || showAllHabits ? null : 4}
        onOpenHabit={(id) => setParam("habit", id)}
      />
      {!wide && view.habits.length > 4 ? (
        <Button variant="ghost" block onClick={() => setShowAllHabits(!showAllHabits)}>
          {showAllHabits ? "Show fewer" : `Show all ${view.habits.length}`}
        </Button>
      ) : null}
    </Panel>
  );
  const fix = (
    <section aria-label="What to fix" className="flex flex-col gap-2.5">
      <h2 className="flex min-h-tap items-center text-lg font-bold">What to fix this week</h2>
      <InsightsPanel view={view} limit={wide || more ? undefined : 1} />
    </section>
  );
  const trend = (
    <Panel title={`Daily score · ${scopeLabel}`}>
      <TrendChart points={view.trend} threshold={threshold} />
    </Panel>
  );
  const categories = (
    <Panel title="Category balance">
      <CategoryBalance categories={view.categories} />
    </Panel>
  );
  const body = (
    <Panel title="Body metrics">
      <BodyMetrics checks={view.bodyChecks} />
    </Panel>
  );

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.16em] text-accent">
          {view.arc.name.toUpperCase()} · DAY {view.dayNumber} OF {view.arc.durationDays} ·{" "}
          {Math.round(view.progress * 100)}%
        </p>
        <h1 className="text-[32px] leading-none font-extrabold tracking-tight lg:text-4xl">
          Dashboard
        </h1>
      </header>

      <section aria-label="Where you stand" className="grid grid-cols-2 gap-2.5 lg:grid-cols-6">
        <StatTile
          label="Today"
          value={avg(tiles.today.score)}
          sub={tiles.today.provisional ? "so far" : "final"}
        />
        <StatTile
          label="This week"
          value={avg(tiles.week.average)}
          delta={tiles.week.change}
          sub="average"
        />
        <StatTile
          label={`${tiles.chapter.label} avg`}
          value={avg(tiles.chapter.average)}
          sub={`${fmt.format(tiles.chapter.total)} / ${fmt.format(tiles.chapter.maxSoFar)}`}
        />
        {wide ? (
          <StatTile
            label="Arc avg"
            value={avg(tiles.arc.average)}
            sub={`${tiles.strongDays.count} strong of ${tiles.strongDays.finalised}`}
          />
        ) : (
          <StatTile
            label="Strong days"
            value={String(tiles.strongDays.count)}
            sub={`of ${tiles.strongDays.finalised} finalised`}
          />
        )}
        <StreakCard streak={view.streak} />
        <RankCard rank={view.rank} durationDays={view.arc.durationDays} />
      </section>

      <FilterRow chapters={view.chapters} filter={view.filter} onChange={setChosen} />

      <div className={cn("transition-opacity", state.refreshing && "opacity-60")}>
        {wide ? (
          <div className="grid grid-cols-12 gap-5">
            <div className="col-span-7">{heatmap}</div>
            <div className="col-span-5">{fix}</div>
            <div className="col-span-7">{trend}</div>
            <div className="col-span-5">{habits}</div>
            <div className="col-span-5">{categories}</div>
            <div className="col-span-7">{body}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {heatmap}
            {habits}
            {fix}
            {more ? (
              <>
                {trend}
                {categories}
                {body}
              </>
            ) : null}
            <Button variant="secondary" block aria-expanded={more} onClick={() => setMore(!more)}>
              {more ? "Fewer insights" : "More insights"}
              <ChevronDown
                className={cn("transition-transform", more && "rotate-180")}
                aria-hidden="true"
              />
            </Button>
          </div>
        )}
      </div>

      <DayDetailSheet
        date={openDay && /^\d{4}-\d{2}-\d{2}$/.test(openDay) ? openDay : null}
        threshold={threshold}
        onClose={() => setParam("day", null)}
      />
      <HabitDetailSheet habitId={openHabit} onClose={() => setParam("habit", null)} />
    </div>
  );
}
