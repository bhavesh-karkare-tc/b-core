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
import { useMediaQuery } from "../lib/use-media-query";
import { FilterRow } from "./filter-row";
import { HabitBars } from "./habit-bars";
import { Heatmap } from "./heatmap";
import { InsightsPanel } from "./insights-panel";
import { RankCard } from "./rank-card";
import { StatTile } from "./stat-tile";
import { StreakCard } from "./streak-card";
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

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.16em] text-accent">
          DAY {view.dayNumber} OF {view.arc.durationDays} · {Math.round(view.progress * 100)}%
        </p>
        <h1 className="text-[32px] leading-none font-extrabold tracking-tight lg:text-4xl">
          Dashboard
        </h1>
      </header>

      <section aria-label="Where you stand" className="grid grid-cols-2 gap-2.5">
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
        <StatTile
          label="Strong days"
          value={String(tiles.strongDays.count)}
          sub={`of ${tiles.strongDays.finalised} finalised`}
        />
        <StreakCard streak={view.streak} />
        <RankCard rank={view.rank} durationDays={view.arc.durationDays} />
      </section>

      <FilterRow chapters={view.chapters} filter={view.filter} onChange={setChosen} />

      <div
        className={cn("flex flex-col gap-5 transition-opacity", state.refreshing && "opacity-60")}
      >
        <section aria-labelledby="heatmap-heading" className="flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <h2 id="heatmap-heading" className="text-lg font-bold">
              {scopeLabel} heatmap
            </h2>
            <Link
              href="/winter-arc/tracker"
              className="inline-flex min-h-tap items-center text-[13px] text-accent"
            >
              Open tracker
            </Link>
          </div>
          <div className="rounded-card border border-line bg-surface p-3">
            <Heatmap
              cells={view.heatmap}
              layout={view.filter.kind === "arc" ? "weeks" : "calendar"}
              onOpenDay={(d) => setParam("day", d)}
            />
          </div>
        </section>

        <section aria-labelledby="habits-heading" className="flex flex-col gap-2">
          <h2 id="habits-heading" className="text-lg font-bold">
            Weakest habits first
          </h2>
          <div className="rounded-card border border-line bg-surface p-2">
            <HabitBars habits={view.habits} limit={showAllHabits ? null : 4} />
            {view.habits.length > 4 ? (
              <Button variant="ghost" block onClick={() => setShowAllHabits(!showAllHabits)}>
                {showAllHabits ? "Show fewer" : `Show all ${view.habits.length}`}
              </Button>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="fix-heading" className="flex flex-col gap-2">
          <h2 id="fix-heading" className="text-lg font-bold">
            Fix this week
          </h2>
          <InsightsPanel view={view} limit={more ? undefined : 1} />
        </section>

        <Button variant="secondary" block aria-expanded={more} onClick={() => setMore(!more)}>
          {more ? "Fewer insights" : "More insights"}
          <ChevronDown
            className={cn("transition-transform", more && "rotate-180")}
            aria-hidden="true"
          />
        </Button>
      </div>

      <DayDetailSheet
        date={openDay && /^\d{4}-\d{2}-\d{2}$/.test(openDay) ? openDay : null}
        threshold={view.arc.strongThreshold}
        onClose={() => setParam("day", null)}
      />
    </div>
  );
}
