import { describe, expect, it } from "vitest";
import { getSubscriptionStatus, type StatusInput } from "./status";

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
