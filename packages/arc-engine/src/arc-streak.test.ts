import { describe, expect, it } from "vitest";
import { dayCodes } from "./__fixtures__/days";
import { computeArcStreak, INITIAL_ARC_STREAK, stepArcStreak } from "./arc-streak";
import type { Chapter } from "./types";

const run = (codes: string) => computeArcStreak(dayCodes(codes)).state;

describe("arc streak: never miss two", () => {
  it("TC30: a strong day adds 1 and is Safe", () => {
    expect(run("S")).toMatchObject({ current: 1, state: "safe", lastStrongDate: "2026-10-01" });
  });

  it("TC31: first weak day after 5 strong holds at 5, At risk", () => {
    expect(run("SSSSSW")).toMatchObject({ current: 5, state: "at_risk" });
  });

  it("a strong day after At risk recovers to Safe and grows", () => {
    expect(run("SSSSSWS")).toMatchObject({ current: 6, state: "safe" });
  });

  it("TC32: two weak days with no shield → 0, Broken, best kept", () => {
    expect(run("SSSSSWW")).toMatchObject({ current: 0, state: "broken", best: 5, shieldsHeld: 0 });
  });

  it("a strong day after Broken starts again at 1, Safe", () => {
    expect(run("SSWWS")).toMatchObject({ current: 1, state: "safe", best: 2 });
  });

  it("TC33: two weak days with 1 shield → shield used, streak holds, shields 0", () => {
    const { state, history } = computeArcStreak(dayCodes("SSSSSSSWW"));
    expect(state).toMatchObject({ current: 7, state: "shielded", shieldsHeld: 0 });
    expect(history.at(-1)).toMatchObject({ shieldUsed: true, state: "shielded" });
  });

  it("E11: shield is used automatically and shieldsHeld drops by 1", () => {
    const { history } = computeArcStreak(dayCodes("SSSSSSSSSSSSSSWW"));
    expect(history.at(-3)?.shieldsHeld).toBe(2);
    expect(history.at(-1)).toMatchObject({ shieldsHeld: 1, shieldUsed: true });
  });

  it("R1: a third weak day after a shield needs another shield", () => {
    // 14 strong → 2 shields; W W W uses both and holds
    expect(run(`${"S".repeat(14)}WWW`)).toMatchObject({
      current: 14,
      state: "shielded",
      shieldsHeld: 0,
    });
    // 7 strong → 1 shield; W W (shield) W → broken
    expect(run(`${"S".repeat(7)}WWW`)).toMatchObject({ current: 0, state: "broken", best: 7 });
  });

  it("a weak day after a shielded day then strong resets the weak run", () => {
    // W W(shield) S W → the last W is a first weak day again
    expect(run(`${"S".repeat(7)}WWSW`)).toMatchObject({ current: 8, state: "at_risk" });
  });

  it("weak days from a zero start: At risk, then Broken", () => {
    expect(run("WW")).toMatchObject({ current: 0, state: "broken", shieldsHeld: 0 });
    expect(run("W")).toMatchObject({ current: 0, state: "at_risk" });
  });
});

describe("shields", () => {
  it("TC34: 7 consecutive strong days earn 1 shield", () => {
    const { state, history } = computeArcStreak(dayCodes("SSSSSSS"));
    expect(state.shieldsHeld).toBe(1);
    expect(history.at(-1)?.shieldEarned).toBe(true);
    expect(history.at(-2)?.shieldEarned).toBe(false);
  });

  it("TC35: 21 strong days with no use → shields stay at 2", () => {
    const { state, history } = computeArcStreak(dayCodes("S".repeat(21)));
    expect(state.shieldsHeld).toBe(2);
    expect(history.at(-1)?.shieldEarned).toBe(false); // day 21 would be the 3rd
  });

  it("a weak day resets the 7-day count", () => {
    expect(run("SSSSSSWSSSSSS").shieldsHeld).toBe(0); // 6 + 6, never 7 in a row
  });
});

describe("sick days (frozen)", () => {
  it("TC23: a sick day freezes the streak", () => {
    const { state, history } = computeArcStreak(dayCodes("SSSK"));
    expect(state).toMatchObject({ current: 3, state: "safe" });
    expect(history.at(-1)).toMatchObject({ frozen: true, current: 3 });
  });

  it("TC29: a sick day is not weak — S W K S stays alive", () => {
    expect(run("SWKS")).toMatchObject({ current: 2, state: "safe" });
  });

  it("R2: weak → sick → weak counts as two weak days in a row", () => {
    expect(run("SSSWKW")).toMatchObject({ current: 0, state: "broken", best: 3 });
  });

  it("R2: sick does not split the 7-strong-days shield run", () => {
    expect(run("SSSKSSSS").shieldsHeld).toBe(1);
  });
});

describe("recalculation and best streaks", () => {
  it("TC36: changing yesterday from weak to strong updates the streak from there", () => {
    const before = computeArcStreak(dayCodes("SSSSSWW"));
    expect(before.state).toMatchObject({ current: 0, state: "broken" });
    // Yesterday (day 6) edited to strong before cutoff:
    const after = computeArcStreak(dayCodes("SSSSSSW"));
    expect(after.state).toMatchObject({ current: 6, state: "at_risk" });
  });

  it("sorts input by date", () => {
    const days = dayCodes("SSW").reverse();
    expect(computeArcStreak(days).state).toMatchObject({ current: 2, state: "at_risk" });
  });

  it("tracks best streak per chapter", () => {
    const chapters: Chapter[] = [
      { index: 1, month: "2026-10", startDate: "2026-10-01", endDate: "2026-10-03", days: 3 },
      { index: 2, month: "2026-11", startDate: "2026-10-04", endDate: "2026-10-31", days: 28 },
      { index: 3, month: "2026-12", startDate: "2026-12-01", endDate: "2026-12-31", days: 31 },
    ];
    // Ch1: S S S → 3. Ch2: S W W S S → 4 then broken then 2 → best 4.
    const { bestByChapter } = computeArcStreak(dayCodes("SSSSWWSS"), chapters);
    expect(bestByChapter).toEqual({ 1: 3, 2: 4, 3: 0 });
  });

  it("stepArcStreak starts from the initial state", () => {
    const day = dayCodes("S")[0];
    if (!day) throw new Error("fixture");
    expect(stepArcStreak(INITIAL_ARC_STREAK, day).next.current).toBe(1);
  });

  it("empty history is the initial state", () => {
    expect(computeArcStreak([]).state).toEqual(INITIAL_ARC_STREAK);
  });
});
