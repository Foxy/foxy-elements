import { describe, expect, it } from "vitest";
import { createIntl } from "react-intl";
import { frequencyLabel } from "./frequency-label";
import enUsMessages from "@/locales/en-US.json";

const intl = createIntl({
  locale: "en-US",
  messages: enUsMessages as Record<string, string>,
});

/**
 * Renders through the real `en-US.json` catalog rather than asserting on
 * message ids. The ICU plural branches are the substance here -- "Monthly"
 * against "Every 2 months" -- and an id-only assertion would pass with both
 * branches written wrongly.
 */
const render = (frequency: string) => {
  const label = frequencyLabel(frequency);
  return label
    ? intl.formatMessage(label.message, { count: label.count })
    : null;
};

describe("frequencyLabel", () => {
  it("names a period of one after itself, not by its count", () => {
    expect(render("1d")).toBe("Daily");
    expect(render("1w")).toBe("Weekly");
    expect(render("1m")).toBe("Monthly");
    expect(render("1y")).toBe("Yearly");
  });

  it("counts a period of more than one", () => {
    expect(render("2d")).toBe("Every 2 days");
    expect(render("3w")).toBe("Every 3 weeks");
    expect(render("6m")).toBe("Every 6 months");
    expect(render("2y")).toBe("Every 2 years");
  });

  it("names Foxy's twice-a-month frequency", () => {
    // The generic path would reach the plural `other` branch and render
    // "Every 0.5 months", which reads like a bug rather than a schedule.
    expect(render(".5m")).toBe("Twice a month");
    expect(render("0.5m")).toBe("Twice a month");
  });

  it("refuses anything it cannot read, rather than inventing a period", () => {
    // `null` is what makes the caller fall back to the raw string. Naming
    // the wrong billing period is worse than showing API syntax, because
    // the customer cannot tell an invented one is wrong.
    expect(frequencyLabel("")).toBeNull();
    expect(frequencyLabel("1")).toBeNull();
    expect(frequencyLabel("m")).toBeNull();
    expect(frequencyLabel("1x")).toBeNull();
    expect(frequencyLabel("-1m")).toBeNull();
    expect(frequencyLabel("0m")).toBeNull();
    expect(frequencyLabel("1m2w")).toBeNull();
  });

  it("reads a frequency the same way the price line does", () => {
    // Both go through `parseFrequencyParts`, so a card reading "$42.00/wk"
    // and a Select reading "Weekly" can never disagree about "1w".
    expect(render(" 1w ")).toBe("Weekly");
  });
});
