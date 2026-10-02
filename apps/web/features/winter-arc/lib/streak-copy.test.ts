import { describe, expect, it } from "vitest";
import { streakEffectCopy } from "./streak-copy";

describe("streakEffectCopy", () => {
  it("covers every effect without shame copy", () => {
    expect(streakEffectCopy("grows", 10)).toBe("Streak safe, 10 days.");
    expect(streakEffectCopy("grows", 1)).toBe("Streak safe, 1 day.");
    expect(streakEffectCopy("holds", 0)).toBe("Streak holds at 0.");
    expect(streakEffectCopy("at_risk", 5)).toBe("One weak day. Don't miss two.");
    expect(streakEffectCopy("shielded", 7)).toBe("Shield used. Streak holds at 7.");
    expect(streakEffectCopy("broken", 0)).toBe("Streak resets. Restart strong tomorrow.");
    expect(streakEffectCopy("frozen", 9)).toBe("Sick day. Streak frozen at 9.");
    for (const e of ["grows", "holds", "at_risk", "shielded", "broken", "frozen"] as const) {
      expect(streakEffectCopy(e, 3).toLowerCase()).not.toContain("fail");
    }
  });
});
