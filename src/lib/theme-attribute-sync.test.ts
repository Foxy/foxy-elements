import { describe, expect, it } from "vitest";
import { deriveInputMetrics, parseFontShorthand, remToPx } from "./theme-attribute-sync";

describe("parseFontShorthand", () => {
  it("splits a weight/size/line-height/family shorthand into size and family", () => {
    expect(
      parseFontShorthand("400 1rem/1.25 Albert Sans, sans-serif"),
    ).toEqual({ fontSize: "1rem", fontFamily: "Albert Sans, sans-serif" });
  });

  it("handles a different weight and size", () => {
    expect(
      parseFontShorthand("600 0.875rem/1.25 Albert Sans, sans-serif"),
    ).toEqual({ fontSize: "0.875rem", fontFamily: "Albert Sans, sans-serif" });
  });
});

describe("remToPx", () => {
  it("converts a rem value at the given root font size", () => {
    expect(remToPx("2.5rem", 16)).toBe("40px");
  });

  it("passes through values that aren't in rem unchanged", () => {
    expect(remToPx("40px", 16)).toBe("40px");
  });
});

describe("deriveInputMetrics", () => {
  it("derives height as control size minus twice the border width, in px", () => {
    const metrics = deriveInputMetrics({
      controlSize: "2.5rem",
      borderWidth: "0.125rem",
      fontBody: "400 1rem/1.25 Albert Sans, sans-serif",
      rootFontSizePx: 16,
    });

    // control: 2.5rem = 40px, border: 0.125rem = 2px, height = 40 - 2*2 = 36
    expect(metrics.heightPx).toBe(36);
  });

  it("derives horizontal padding as a quarter of the control size, no vertical padding", () => {
    const metrics = deriveInputMetrics({
      controlSize: "2.5rem",
      borderWidth: "0.125rem",
      fontBody: "400 1rem/1.25 Albert Sans, sans-serif",
      rootFontSizePx: 16,
    });

    // 40px / 4 = 10px
    expect(metrics.paddingX).toBe("10px");
    expect(metrics.paddingY).toBe("0px");
  });

  it("resolves font size and family from the font shorthand", () => {
    const metrics = deriveInputMetrics({
      controlSize: "2.5rem",
      borderWidth: "0.125rem",
      fontBody: "400 1rem/1.25 Albert Sans, sans-serif",
      rootFontSizePx: 16,
    });

    expect(metrics.fontSize).toBe("16px");
    expect(metrics.fontFamily).toBe("Albert Sans, sans-serif");
  });
});
