import { describe, expect, it } from "vitest";
import { defaultTheme, type DesignSystemTheme } from "@foxy.io/design-system/theme";

import {
  buildStripeAppearanceFromTokens,
  buildStripeCardElementStyle,
  getStripeFontsForAppearance,
} from "./style-hooks";

function rules(theme: DesignSystemTheme = defaultTheme) {
  return buildStripeAppearanceFromTokens(theme).rules as Record<
    string,
    Record<string, string>
  >;
}

function variables(theme: DesignSystemTheme = defaultTheme) {
  return buildStripeAppearanceFromTokens(theme).variables as Record<string, string>;
}

describe("buildStripeAppearanceFromTokens", () => {
  // Regression test: `spacingUnit` is the base unit Stripe multiplies through
  // the whole Payment Element. It used to be fed `space.md` (a 12px semantic
  // gap), which inflated every derived measurement 3x — 290px-tall tabs, a tab
  // row wide enough to clip, and ~120px between field rows.
  it("feeds Stripe's base spacing unit from the 4px grid token, not space.md", () => {
    expect(variables().spacingUnit).toBe(defaultTheme.space.xs);
    expect(variables().spacingUnit).not.toBe(defaultTheme.space.md);
  });

  it("sets the field grid gap from space.md", () => {
    expect(variables().gridRowSpacing).toBe(defaultTheme.space.md);
    expect(variables().gridColumnSpacing).toBe(defaultTheme.space.md);
  });

  // `.Input` is a form field, not a surface: it has to match the native inputs
  // beside it, which paint `background.field`.
  it("paints .Input with background.field and .Block with background.surface", () => {
    const background: Record<string, string> = {
      ...defaultTheme.background,
      field: "#FFF8E1",
      surface: "#FFFFFF",
    };
    const theme = { ...defaultTheme, background } as unknown as DesignSystemTheme;

    expect(rules(theme)[".Input"].backgroundColor).toBe("#FFF8E1");
    expect(rules(theme)[".Block"].backgroundColor).toBe("#FFFFFF");
  });

  it("draws borders at the DS border width rather than a hardcoded 1px", () => {
    for (const selector of [".Input", ".Tab", ".Tab--selected", ".CheckboxInput"]) {
      expect(rules()[selector].border).toContain(defaultTheme.size.borderWidth);
      expect(rules()[selector].border).not.toContain("1px solid");
    }
  });

  // Stripe's rule set has no `height`, so `.Input` is sized by padding. Total
  // height has to come out at `size.control` so the field lines up with the
  // native ones; it previously used a flat 0px and rendered at roughly half.
  it("pads .Input so its box height matches size.control", () => {
    const { padding, fontSize, lineHeight } = rules()[".Input"];
    const paddingYPx = Number.parseFloat(padding.split(" ")[0]);
    const borderPx = Number.parseFloat(defaultTheme.size.borderWidth) * 16;
    const lineBoxPx = Number.parseFloat(fontSize) * Number.parseFloat(lineHeight);
    const controlPx = Number.parseFloat(defaultTheme.size.control) * 16;

    expect(paddingYPx * 2 + borderPx * 2 + lineBoxPx).toBe(controlPx);
  });
});

describe("getStripeFontsForAppearance", () => {
  // Stripe renders cross-origin, so the host page's webfont is not available
  // to it — the family has to be paired with a stylesheet. This only resolved
  // Inter, so the DS body font never reached the iframe.
  it("resolves a webfont stylesheet for the DS body font", () => {
    const fonts = getStripeFontsForAppearance(
      buildStripeAppearanceFromTokens(defaultTheme),
    );

    expect(fonts).toHaveLength(1);
    expect((fonts as [{ cssSrc: string }])[0].cssSrc).toContain("Albert+Sans");
  });

  it("returns no stylesheet for a family outside the allowlist", () => {
    expect(
      getStripeFontsForAppearance({ variables: { fontFamily: "Comic Sans MS" } }),
    ).toBeUndefined();
  });

  it("prefers an explicitly configured font over the allowlist", () => {
    const configured = [{ cssSrc: "https://example.test/font.css" }];

    expect(
      getStripeFontsForAppearance(
        buildStripeAppearanceFromTokens(defaultTheme),
        configured,
      ),
    ).toBe(configured);
  });
});

describe("buildStripeCardElementStyle", () => {
  // The legacy Card Element ignores the `appearance` API entirely and is styled
  // through its own `style` option, which was never being passed.
  it("carries the theme's text colour, family and placeholder colour", () => {
    const style = buildStripeCardElementStyle(defaultTheme);

    expect(style.base.color).toBe(defaultTheme.color.body);
    expect(style.base.fontFamily).toContain("Albert Sans");
    expect(style.base["::placeholder"]).toEqual({
      color: defaultTheme.color.secondary,
    });
    expect(style.invalid.color).toBe(defaultTheme.color.error);
  });
});
