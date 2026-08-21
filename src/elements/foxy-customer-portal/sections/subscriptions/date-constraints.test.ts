import { describe, expect, it } from "vitest";
import { toDatePickerBounds, toLocalDateString } from "./date-constraints";

// react-day-picker, with no `timeZone` option (Task 6 must not set one), builds
// each calendar cell as local midnight: `new Date(year, monthIndex, date)`. Every
// date below is built the same way so the tests exercise the real contract
// instead of agreeing with a UTC-based implementation that disagrees with the
// picker.
const FROM = new Date(2026, 2, 10); // March 10, 2026, local midnight.

/** Builds a calendar cell the way DayPicker does when no `timeZone` is set. */
function localDay(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day);
}

describe("toDatePickerBounds", () => {
  it("has no bounds and disables nothing when the store sets no rules", () => {
    const bounds = toDatePickerBounds({}, FROM);

    expect(bounds.startMonth).toBeUndefined();
    expect(bounds.endMonth).toBeUndefined();
    expect(bounds.disabled).toEqual([]);
  });

  it("turns a min frequency into a lower bound", () => {
    const bounds = toDatePickerBounds({ min: "2w" }, FROM);
    const expected = localDay(2026, 2, 24); // 2 weeks from FROM, local.

    expect(bounds.startMonth).toEqual(expected);
    expect(bounds.disabled).toContainEqual({ before: expected });
  });

  it("turns a max frequency into an upper bound", () => {
    const bounds = toDatePickerBounds({ max: "1w" }, FROM);
    const expected = localDay(2026, 2, 17); // 1 week from FROM, local.

    expect(bounds.endMonth).toEqual(expected);
    expect(bounds.disabled).toContainEqual({ after: expected });
  });

  it("disables individual disallowed dates", () => {
    const bounds = toDatePickerBounds(
      { disallowedDates: ["2026-03-15", "2026-03-16"] },
      FROM,
    );

    expect(bounds.disabled).toContainEqual(localDay(2026, 2, 15));
    expect(bounds.disabled).toContainEqual(localDay(2026, 2, 16));
  });

  it("expands a disallowed range into its endpoints", () => {
    const bounds = toDatePickerBounds(
      { disallowedDates: ["2026-03-15..2026-03-18"] },
      FROM,
    );

    expect(bounds.disabled).toContainEqual({
      from: localDay(2026, 2, 15),
      to: localDay(2026, 2, 18),
    });
  });

  it("matches a disallowed date against DayPicker's local calendar cell, not a UTC-shifted neighbour", () => {
    // This is the exact case the UTC implementation got wrong: a matcher built
    // at UTC midnight lands on a different local calendar day almost anywhere
    // outside UTC+0, so the forbidden date stayed pickable and a neighbouring,
    // allowed date got disabled instead.
    const bounds = toDatePickerBounds(
      { disallowedDates: ["2026-03-15"] },
      FROM,
    );
    const matcher = bounds.disabled.find(
      (entry): entry is Date => entry instanceof Date,
    );

    expect(matcher).toEqual(localDay(2026, 2, 15));
    expect(matcher).not.toEqual(localDay(2026, 2, 14));
    expect(matcher).not.toEqual(localDay(2026, 2, 16));
  });

  it("disables every day of the week when the store's allow-list is empty", () => {
    // The SDK builds `allowedDaysOfWeek` by spreading `rule.allowedDays.days`,
    // so `allowed_days: { type: 'day', days: [] }` arrives here as `[]` --
    // falsy `.length`, indistinguishable from "no rule at all" if this
    // guards on truthiness instead of `!== undefined`. An empty allow-list is
    // taken at its literal reading: no day is allowed, so every day disables.
    const bounds = toDatePickerBounds({ allowedDaysOfWeek: [] }, FROM);
    const matcher = bounds.disabled.find(
      (entry): entry is { dayOfWeek: number[] } =>
        typeof entry === "object" && entry !== null && "dayOfWeek" in entry,
    );

    expect(matcher?.dayOfWeek).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("inverts allowed weekdays into a disable matcher", () => {
    // Foxy: 1 = Monday .. 7 = Sunday. Date.getDay(): 0 = Sunday, local.
    // Allowing Monday and Wednesday must disable the other five.
    const bounds = toDatePickerBounds({ allowedDaysOfWeek: [1, 3] }, FROM);
    const matcher = bounds.disabled.find(
      (entry): entry is { dayOfWeek: number[] } =>
        typeof entry === "object" && entry !== null && "dayOfWeek" in entry,
    );

    expect(matcher?.dayOfWeek).toEqual([0, 2, 4, 5, 6]);
  });

  it("inverts allowed days of month into a predicate that matches DayPicker's local cells", () => {
    const bounds = toDatePickerBounds({ allowedDaysOfMonth: [1, 15] }, FROM);
    const predicate = bounds.disabled.find(
      (entry): entry is (date: Date) => boolean => typeof entry === "function",
    );

    expect(predicate?.(localDay(2026, 2, 15))).toBe(false); // allowed
    expect(predicate?.(localDay(2026, 2, 1))).toBe(false); // allowed
    expect(predicate?.(localDay(2026, 2, 16))).toBe(true); // disallowed
  });

  it("disables every day of the month when the store's allow-list is empty", () => {
    const bounds = toDatePickerBounds({ allowedDaysOfMonth: [] }, FROM);
    const predicate = bounds.disabled.find(
      (entry): entry is (date: Date) => boolean => typeof entry === "function",
    );

    expect(predicate?.(localDay(2026, 2, 1))).toBe(true);
    expect(predicate?.(localDay(2026, 2, 15))).toBe(true);
    expect(predicate?.(localDay(2026, 2, 31))).toBe(true);
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

describe("toLocalDateString", () => {
  it("keeps the local calendar day instead of shifting to UTC's", () => {
    // Choose an hour where the local calendar day and the UTC calendar day
    // differ, whichever side of UTC this runner sits on. A fixed hour like
    // midnight would only fail this test in zones east of UTC, and this
    // sandbox is west of UTC — the bug this guards against was invisible here
    // precisely because a naive `toISOString().slice(0, 10)` happened to
    // agree with the local day in that direction.
    const offsetMinutes = new Date().getTimezoneOffset(); // > 0 west of UTC, < 0 east.

    if (offsetMinutes === 0) {
      // The runner is at UTC itself: local and UTC calendar days can never
      // differ here, so this test cannot discriminate either implementation.
      return;
    }

    const hour = offsetMinutes > 0 ? 23 : 0;
    const picked = new Date(2026, 2, 15, hour);

    expect(toLocalDateString(picked)).toBe("2026-03-15");
    // Prove the naive `toISOString()` form really does disagree here, so this
    // test cannot quietly stop discriminating if someone "simplifies" the
    // helper back to it.
    expect(picked.toISOString().slice(0, 10)).not.toBe("2026-03-15");
  });

  it("zero-pads single-digit months and days", () => {
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
