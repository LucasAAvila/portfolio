import { describe, expect, it } from "vitest";

import { cn, gradientIndexForSlug } from "./utils";

describe("cn", () => {
  it("concatenates truthy classes", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy entries", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("merges Tailwind classes, preferring the later one for the same property", () => {
    // tailwind-merge knows that two `p-*` classes conflict; the later one wins.
    expect(cn("p-2 p-4")).toBe("p-4");
  });
});

describe("gradientIndexForSlug", () => {
  it("returns a value within [0, count)", () => {
    for (let i = 0; i < 50; i++) {
      const idx = gradientIndexForSlug(`slug-${i}`, 4);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(4);
    }
  });

  it("is deterministic for the same input", () => {
    expect(gradientIndexForSlug("expense-tracker")).toBe(gradientIndexForSlug("expense-tracker"));
  });

  it("uses the default count of 4 when not specified", () => {
    expect(gradientIndexForSlug("any-slug")).toBeLessThan(4);
  });

  it("respects a custom count", () => {
    for (let i = 0; i < 20; i++) {
      expect(gradientIndexForSlug(`slug-${i}`, 3)).toBeLessThan(3);
    }
  });
});
