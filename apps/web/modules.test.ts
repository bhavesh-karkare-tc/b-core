import { describe, expect, it } from "vitest";
import { findActiveModule, isActivePath, modules } from "./modules";

describe("isActivePath", () => {
  it("matches Home only on the exact root", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/winter-arc/today", "/")).toBe(false);
  });

  it("matches a page and its sub-pages", () => {
    expect(isActivePath("/winter-arc/reports", "/winter-arc/reports")).toBe(true);
    expect(isActivePath("/winter-arc/reports/week-3", "/winter-arc/reports")).toBe(true);
  });

  it("does not match a sibling that shares a prefix", () => {
    expect(isActivePath("/winter-arc/today-old", "/winter-arc/today")).toBe(false);
  });
});

describe("findActiveModule", () => {
  it("finds Winter Arc for any route under /winter-arc", () => {
    expect(findActiveModule("/winter-arc/tracker")?.id).toBe("winter-arc");
  });

  it("returns undefined outside a module", () => {
    expect(findActiveModule("/settings")).toBeUndefined();
  });
});

describe("modules", () => {
  it("Winter Arc exposes the four module tabs in order (MASTER_DOC §13)", () => {
    expect(modules[0]?.tabs.map((t) => t.label)).toEqual([
      "Today",
      "Tracker",
      "Dashboard",
      "Reports",
    ]);
  });
});
