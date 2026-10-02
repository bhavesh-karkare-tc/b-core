import { describe, expect, it } from "vitest";
import { parseNumber } from "./parse-number";

describe("parseNumber", () => {
  it("keeps decimals and accepts a comma", () => {
    expect(parseNumber("78.5", true)).toBe(78.5);
    expect(parseNumber("78,5", true)).toBe(78.5);
    expect(parseNumber("78.", true)).toBe(78);
  });

  it("integers drop non-digits", () => {
    expect(parseNumber("3 0", false)).toBe(30);
    expect(parseNumber("78.5", false)).toBe(785);
  });

  it("empty or junk is null", () => {
    expect(parseNumber("", true)).toBeNull();
    expect(parseNumber(".", true)).toBeNull();
    expect(parseNumber("1.2.3", true)).toBeNull();
  });
});
