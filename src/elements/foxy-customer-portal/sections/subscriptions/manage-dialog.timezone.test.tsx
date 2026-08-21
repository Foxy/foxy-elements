import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { mountScreen, type MountedScreen } from "../../test-utils";
import { ManageDialog } from "./manage-dialog";
import type * as DateConstraints from "./date-constraints";

/**
 * `date-constraints.ts` documents that its local-day matchers are correct
 * only as long as `<Calendar>` (react-day-picker) is never given a
 * `timeZone`: with one set, `dateLib.newDate()` builds each calendar cell as
 * a `TZDate` (from `@date-fns/tz`) instead of a plain `Date`. A `TZDate`
 * still passes `instanceof Date` -- its prototype chain does not include
 * `Date.prototype` -- so `Object.getPrototypeOf(cell) === Date.prototype` is
 * a zone-independent way to tell the two apart. A rendered-digits assertion
 * would only disagree for an explicit zone west of wherever this suite
 * happens to run; this does not depend on the runner's zone at all.
 *
 * `toDatePickerBounds` is mocked to hand `<Calendar>` a probe function
 * matcher instead of its real disable rules, so every `date` DayPicker
 * checks against it gets recorded. `manage-dialog.tsx` itself is untouched --
 * this only observes what it hands to the real `<Calendar>`/`DayPicker`.
 */
let seenDates: Date[];

vi.mock("./date-constraints", async (importOriginal) => {
  const actual = await importOriginal<typeof DateConstraints>();
  return {
    ...actual,
    toDatePickerBounds: () => ({
      disabled: [
        (date: Date) => {
          seenDates.push(date);
          return false;
        },
      ],
    }),
  };
});

let screen: MountedScreen | null = null;

beforeEach(() => {
  seenDates = [];
});

afterEach(() => {
  act(() => screen?.unmount());
  screen = null;
});

// `allow_next_date_modification` has to resolve to an *object*, not the
// boolean `true`/`false` shorthand -- `ManageDialog` only calls
// `toDatePickerBounds` (mocked above) in the object branch.
const SETTINGS = {
  subscriptions: {
    allow_frequency_modification: [{ jsonata_query: "*", values: ["1m"] }],
    allow_next_date_modification: [{ jsonata_query: "*", min: "1d" }],
  },
};

function subscription() {
  return {
    frequency: "1m",
    start_date: "2026-01-01T00:00:00-0700",
    next_transaction_date: "2099-01-01T00:00:00Z",
    end_date: null,
    is_active: true,
    error_message: "",
    first_failed_transaction_date: null,
    _links: { self: { href: "/s/1" } },
  };
}

describe("ManageDialog's Calendar disabled matcher", () => {
  it("only ever receives a plain Date, never a TZDate", () => {
    screen = mountScreen(
      <ManageDialog
        subscription={subscription() as never}
        settings={SETTINGS as never}
        open
        onClose={() => {}}
      />,
      {},
    );

    // The matcher has to have actually been invoked, or the assertion below
    // would pass vacuously because the loop never runs.
    expect(seenDates.length).toBeGreaterThan(0);

    for (const date of seenDates) {
      expect(Object.getPrototypeOf(date)).toBe(Date.prototype);
    }
  });
});
