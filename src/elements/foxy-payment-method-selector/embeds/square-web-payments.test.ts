import { describe, expect, it } from "vitest";
import { defaultTheme, type DesignSystemTheme } from "@foxy.io/design-system/theme";

import { buildSquareWebPaymentsStyles } from "./square-web-payments";

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
