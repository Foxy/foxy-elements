import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { useIntl } from "react-intl";
import { mountScreen } from "./test-utils";

/**
 * Reads `useIntl().timeZone` and hands it to the caller.
 *
 * `IntlShape` (what `useIntl()` returns) carries `timeZone` straight off the
 * `IntlProvider` it was resolved from -- `undefined` when the provider was
 * never given one. That makes it a zone-independent probe: unlike asserting
 * on formatted digits (which only disagree for an explicit zone west of
 * whatever zone the test runner happens to be in), this goes red for *any*
 * explicit `timeZone`, including one that happens to match the runner's own.
 */
function TimeZoneProbe({
  onRead,
}: {
  onRead: (timeZone: string | undefined) => void;
}) {
  onRead(useIntl().timeZone);
  return null;
}

// Distinguishes "the probe never rendered" from "it rendered with `undefined`" --
// both would otherwise look identical to `toBeUndefined()`.
const UNREAD = Symbol("unread");

describe("mountScreen", () => {
  it("sets no explicit IntlProvider timeZone", () => {
    // `mountScreen`'s doc comment says it mirrors the provider stack
    // `<foxy-customer-portal>` sets up in production. `calendar-date.ts`
    // documents that every screen relying on `toCalendarDate` -- the fix for
    // three shipped UTC/local date bugs -- is correct only as long as that
    // holds. Nothing enforced it before this test.
    let observed: string | undefined | typeof UNREAD = UNREAD;

    const screen = mountScreen(
      createElement(TimeZoneProbe, {
        onRead: (timeZone) => {
          observed = timeZone;
        },
      }),
      {},
    );

    try {
      expect(observed).not.toBe(UNREAD);
      expect(observed).toBeUndefined();
    } finally {
      screen.unmount();
    }
  });
});
