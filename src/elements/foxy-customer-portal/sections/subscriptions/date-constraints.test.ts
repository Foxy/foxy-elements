import { describe, expect, it } from "vitest";
import { toDatePickerBounds } from "./date-constraints";

const FROM = new Date("2026-03-10T00:00:00.000Z");

describe("toDatePickerBounds", () => {
  it("has no bounds and disables nothing when the store sets no rules", () => {
    const bounds = toDatePickerBounds({}, FROM);

    expect(bounds.startMonth).toBeUndefined();
    expect(bounds.endMonth).toBeUndefined();
    expect(bounds.disabled).toEqual([]);
  });

  it("turns a min frequency into a lower bound", () => {
    const bounds = toDatePickerBounds({ min: "2w" }, FROM);

    // 2 weeks from FROM.
    expect(bounds.startMonth?.toISOString().slice(0, 10)).toBe("2026-03-24");
    expect(bounds.disabled).toContainEqual({
      before: new Date("2026-03-24T00:00:00.000Z"),
    });
  });

  it("turns a max frequency into an upper bound", () => {
    const bounds = toDatePickerBounds({ max: "1w" }, FROM);

    expect(bounds.endMonth?.toISOString().slice(0, 10)).toBe("2026-03-17");
    expect(bounds.disabled).toContainEqual({
      after: new Date("2026-03-17T00:00:00.000Z"),
    });
  });

  it("disables individual disallowed dates", () => {
    const bounds = toDatePickerBounds(
      { disallowedDates: ["2026-03-15", "2026-03-16"] },
      FROM,
    );

    expect(bounds.disabled).toContainEqual(
      new Date("2026-03-15T00:00:00.000Z"),
    );
    expect(bounds.disabled).toContainEqual(
      new Date("2026-03-16T00:00:00.000Z"),
    );
  });

  it("expands a disallowed range into its endpoints", () => {
    const bounds = toDatePickerBounds(
      { disallowedDates: ["2026-03-15..2026-03-18"] },
      FROM,
    );

    expect(bounds.disabled).toContainEqual({
      from: new Date("2026-03-15T00:00:00.000Z"),
      to: new Date("2026-03-18T00:00:00.000Z"),
    });
  });

  it("inverts allowed weekdays into a disable matcher", () => {
    // Foxy: 1 = Monday .. 7 = Sunday. Date.getDay(): 0 = Sunday.
    // Allowing Monday and Wednesday must disable the other five.
    const bounds = toDatePickerBounds({ allowedDaysOfWeek: [1, 3] }, FROM);
    const matcher = bounds.disabled.find(
      (entry): entry is { dayOfWeek: number[] } =>
        typeof entry === "object" && entry !== null && "dayOfWeek" in entry,
    );

    expect(matcher?.dayOfWeek).toEqual([0, 2, 4, 5, 6]);
  });

  it("inverts allowed days of month into a predicate", () => {
    const bounds = toDatePickerBounds({ allowedDaysOfMonth: [1, 15] }, FROM);
    const predicate = bounds.disabled.find(
      (entry): entry is (date: Date) => boolean => typeof entry === "function",
    );

    expect(predicate?.(new Date("2026-03-15T00:00:00.000Z"))).toBe(false);
    expect(predicate?.(new Date("2026-03-01T00:00:00.000Z"))).toBe(false);
    expect(predicate?.(new Date("2026-03-16T00:00:00.000Z"))).toBe(true);
  });

  it("ignores an unparseable frequency rather than throwing", () => {
    // getTimeFromFrequency throws InvalidFrequencyError on junk. A store with a
    // malformed rule must not blank the whole dialog.
    expect(() =>
      toDatePickerBounds({ min: "not-a-frequency" }, FROM),
    ).not.toThrow();
    expect(
      toDatePickerBounds({ min: "not-a-frequency" }, FROM).startMonth,
    ).toBeUndefined();
  });
});
