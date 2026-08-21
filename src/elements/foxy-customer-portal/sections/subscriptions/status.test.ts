import { describe, expect, it } from "vitest";
import type { CartDisplayConfig } from "./cart-display-config";
import {
  getExtendedSubscriptionStatus,
  getSubscriptionStatus,
  type StatusInput,
} from "./status";

const DAY = 86_400_000;
const iso = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * DAY).toISOString();

function subscription(overrides: Partial<StatusInput> = {}): StatusInput {
  return {
    is_active: true,
    first_failed_transaction_date: null,
    start_date: iso(-30),
    next_transaction_date: iso(30),
    end_date: null,
    ...overrides,
  };
}

describe("getSubscriptionStatus", () => {
  it("returns null without data", () => {
    expect(getSubscriptionStatus(null)).toBeNull();
  });

  it("reports an active subscription with a future payment", () => {
    expect(getSubscriptionStatus(subscription())).toBe("next_payment");
  });

  it("reports a subscription that has not started", () => {
    expect(getSubscriptionStatus(subscription({ start_date: iso(10) }))).toBe(
      "will_start",
    );
  });

  it("reports a failure ahead of everything else", () => {
    const status = getSubscriptionStatus(
      subscription({ first_failed_transaction_date: iso(-2) }),
    );

    expect(status).toBe("failed");
  });

  it("distinguishes a failure that has since ended", () => {
    const status = getSubscriptionStatus(
      subscription({
        first_failed_transaction_date: iso(-10),
        end_date: iso(-1),
      }),
    );

    expect(status).toBe("failed_and_ended");
  });

  it("reports one more payment before the end", () => {
    const status = getSubscriptionStatus(
      subscription({ next_transaction_date: iso(5), end_date: iso(10) }),
    );

    expect(status).toBe("will_end_after_payment");
  });

  it("reports an end with no further payment", () => {
    const status = getSubscriptionStatus(
      subscription({ next_transaction_date: iso(20), end_date: iso(10) }),
    );

    expect(status).toBe("will_end");
  });

  it("reports an inactive subscription", () => {
    expect(getSubscriptionStatus(subscription({ is_active: false }))).toBe(
      "inactive",
    );
  });

  it("reports an inactive subscription that already ended", () => {
    const status = getSubscriptionStatus(
      subscription({ is_active: false, end_date: iso(-5) }),
    );

    expect(status).toBe("ended");
  });

  it("treats the API's zero date as no date at all", () => {
    // An unset end_date comes back as "0000-00-00", not null. Parsed as a real
    // date it lands in the distant past and turns will_end into ended.
    const status = getSubscriptionStatus(
      subscription({ end_date: "0000-00-00" }),
    );

    expect(status).toBe("next_payment");
  });
});

describe("getExtendedSubscriptionStatus", () => {
  it("returns null without data", () => {
    expect(getExtendedSubscriptionStatus(null, null)).toBeNull();
  });

  it("passes every base status through unchanged when no config is given", () => {
    // No config at all (not even an empty object) -- every flag defaults on.
    expect(getExtendedSubscriptionStatus(subscription(), null)).toBe(
      "next_payment",
    );
    expect(
      getExtendedSubscriptionStatus(
        subscription({ is_active: false }),
        null,
      ),
    ).toBe("inactive");
  });

  it("appends _no_startdate to will_start when show_sub_startdate is off", () => {
    const config: CartDisplayConfig = { show_sub_startdate: false };
    const status = getExtendedSubscriptionStatus(
      subscription({ start_date: iso(10) }),
      config,
    );

    expect(status).toBe("will_start_no_startdate");
  });

  it("leaves will_start alone when show_sub_startdate is on", () => {
    const config: CartDisplayConfig = { show_sub_startdate: true };
    const status = getExtendedSubscriptionStatus(
      subscription({ start_date: iso(10) }),
      config,
    );

    expect(status).toBe("will_start");
  });

  it("appends _no_enddate to will_end when show_sub_enddate is off", () => {
    const config: CartDisplayConfig = { show_sub_enddate: false };
    const status = getExtendedSubscriptionStatus(
      subscription({ next_transaction_date: iso(20), end_date: iso(10) }),
      config,
    );

    expect(status).toBe("will_end_no_enddate");
  });

  it("appends _no_nextdate to next_payment when show_sub_nextdate is off", () => {
    const config: CartDisplayConfig = { show_sub_nextdate: false };
    const status = getExtendedSubscriptionStatus(subscription(), config);

    expect(status).toBe("next_payment_no_nextdate");
  });

  it("appends _no_enddate to ended when show_sub_enddate is off", () => {
    const config: CartDisplayConfig = { show_sub_enddate: false };
    const status = getExtendedSubscriptionStatus(
      subscription({ is_active: false, end_date: iso(-5) }),
      config,
    );

    expect(status).toBe("ended_no_enddate");
  });

  it("appends _no_enddate to failed_and_ended when show_sub_enddate is off", () => {
    const config: CartDisplayConfig = { show_sub_enddate: false };
    const status = getExtendedSubscriptionStatus(
      subscription({
        first_failed_transaction_date: iso(-10),
        end_date: iso(-1),
      }),
      config,
    );

    expect(status).toBe("failed_and_ended_no_enddate");
  });

  it("never appends a variant to failed -- it is not a configurable field", () => {
    const config: CartDisplayConfig = {
      show_sub_startdate: false,
      show_sub_nextdate: false,
      show_sub_enddate: false,
    };
    const status = getExtendedSubscriptionStatus(
      subscription({ first_failed_transaction_date: iso(-2) }),
      config,
    );

    expect(status).toBe("failed");
  });

  it("never appends a variant to inactive", () => {
    const config: CartDisplayConfig = {
      show_sub_startdate: false,
      show_sub_nextdate: false,
      show_sub_enddate: false,
    };
    const status = getExtendedSubscriptionStatus(
      subscription({ is_active: false }),
      config,
    );

    expect(status).toBe("inactive");
  });

  describe("will_end_after_payment", () => {
    function willEndAfterPayment(overrides: Partial<StatusInput> = {}) {
      return subscription({
        next_transaction_date: iso(5),
        end_date: iso(10),
        ...overrides,
      });
    }

    it("appends _no_nextdate when only show_sub_nextdate is off", () => {
      const config: CartDisplayConfig = { show_sub_nextdate: false };
      const status = getExtendedSubscriptionStatus(
        willEndAfterPayment(),
        config,
      );

      expect(status).toBe("will_end_after_payment_no_nextdate");
    });

    it("appends _no_enddate when only show_sub_enddate is off", () => {
      const config: CartDisplayConfig = { show_sub_enddate: false };
      const status = getExtendedSubscriptionStatus(
        willEndAfterPayment(),
        config,
      );

      expect(status).toBe("will_end_after_payment_no_enddate");
    });

    it("collapses to next_payment_no_nextdate when both dates are off", () => {
      // The compound case: hiding both dates leaves nothing distinguishing
      // this from a plain active subscription, so it reads as one.
      const config: CartDisplayConfig = {
        show_sub_nextdate: false,
        show_sub_enddate: false,
      };
      const status = getExtendedSubscriptionStatus(
        willEndAfterPayment(),
        config,
      );

      expect(status).toBe("next_payment_no_nextdate");
    });
  });

  it("degrades to the _no_ variant when the configured date can't be parsed as a calendar day", () => {
    // '2023-02-30...' is not a real calendar day. `new Date(...).getTime()`
    // rolls it over to March 2 rather than returning NaN, so the base status
    // logic (an *instant* comparison, deliberately -- see status.ts) still
    // resolves to next_payment. But `toCalendarDate` -- used to render this
    // status's actual date -- rejects the rollover and returns null. Showing
    // "Next payment on " with a blank hole is worse than falling back to the
    // date-free string, so an unformattable date degrades the same way a
    // configured-off date does. This is a deliberate deviation from v1, which
    // has no such fallback.
    const status = getExtendedSubscriptionStatus(
      subscription({ next_transaction_date: "2023-02-30T10:00:00Z" }),
      null,
    );

    expect(status).toBe("next_payment_no_nextdate");
  });
});
