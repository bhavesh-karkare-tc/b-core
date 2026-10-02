import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });

  it("lets later Night Ice utilities override earlier ones", () => {
    expect(cn("bg-surface p-4", "bg-surface-2")).toBe("p-4 bg-surface-2");
    expect(cn("rounded-card", "rounded-control")).toBe("rounded-control");
  });
});

describe("cn with Night Ice theme keys", () => {
  it("merges custom spacing tokens", () => {
    expect(cn("h-tap px-4", "h-12")).toBe("px-4 h-12");
    expect(cn("size-tap", "size-8")).toBe("size-8");
  });

  it("keeps text colour and text size as separate groups", () => {
    expect(cn("text-sm text-text-muted", "text-accent")).toBe("text-sm text-accent");
  });
});
