import { describe, expect, it } from "vitest";
import { buttonVariants } from "./button";
import { chipVariants } from "./chip";

describe("buttonVariants", () => {
  it("default size meets the 44px tap target", () => {
    expect(buttonVariants()).toContain("h-tap");
    expect(buttonVariants({ size: "icon" })).toContain("size-tap");
  });

  it("primary uses accent tokens", () => {
    expect(buttonVariants({ variant: "primary" })).toContain("bg-accent");
  });
});

describe("chipVariants", () => {
  it("defaults to the neutral tone", () => {
    expect(chipVariants()).toContain("bg-surface-2");
  });

  it("ember tone uses ember tokens", () => {
    expect(chipVariants({ tone: "ember" })).toContain("text-ember-soft");
  });
});
