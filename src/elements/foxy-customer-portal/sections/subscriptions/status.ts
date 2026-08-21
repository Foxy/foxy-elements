import type { Rels } from "@foxy.io/sdk/customer";
import type { Resource } from "@foxy.io/sdk/core";
import { toCalendarDate } from "../../calendar-date";
import type { CartDisplayConfig } from "./cart-display-config";

export type StatusInput = Pick<
  Resource<Rels.Subscription>,
  | "is_active"
  | "first_failed_transaction_date"
  | "start_date"
  | "next_transaction_date"
  | "end_date"
>;

export type SubscriptionStatus =
  | "will_start"
  | "will_end"
  | "will_end_after_payment"
  | "next_payment"
  | "ended"
  | "failed"
  | "failed_and_ended"
  | "inactive";

/**
 * Ported from v1's `getSubscriptionStatus`. The order of these checks is the
 * logic: a payment failure outranks everything, and an inactive subscription
 * that already ended reads `ended` rather than `inactive`.
 */
export function getSubscriptionStatus(
  data: StatusInput | null,
): SubscriptionStatus | null {
  if (data === null) return null;

  // The API returns "0000-00-00" for an unset date. Parsed as a real date it
  // lands in the distant past, which would turn `will_end` into `ended`.
  const getTime = (date: string | null) => {
    if (!date || date === "0000-00-00") return null;
    return new Date(date).getTime();
  };

  const isActive = data.is_active;
  const failure = getTime(data.first_failed_transaction_date);
  const start = getTime(data.start_date);
  const next = getTime(data.next_transaction_date);
  const end = getTime(data.end_date);
  const now = Date.now();

  if (failure) return end && end <= now ? "failed_and_ended" : "failed";
  if (start === null) return null;

  if (isActive && start > now) return "will_start";
  if (next === null) return null;

  if (isActive && end && end > now) {
    return next < end ? "will_end_after_payment" : "will_end";
  }

  if (isActive) return end ? "ended" : "next_payment";

  return start <= now && end && end <= now ? "ended" : "inactive";
}

/**
 * The 7 additional statuses `getExtendedSubscriptionStatus` can return, on
 * top of `getSubscriptionStatus`'s 8 base ones. `failed` and `inactive` have
 * no variant: `inactive` carries no date to begin with, and v1 does not gate
 * `first_failed_transaction_date` behind any `cart_display_config` flag (it
 * is not one of the four configurable fields), so neither does this port.
 */
export type ExtendedSubscriptionStatus =
  | SubscriptionStatus
  | "will_start_no_startdate"
  | "will_end_no_enddate"
  | "will_end_after_payment_no_nextdate"
  | "will_end_after_payment_no_enddate"
  | "ended_no_enddate"
  | "next_payment_no_nextdate"
  | "failed_and_ended_no_enddate";

/**
 * Ported from v1's `getExtendedSubscriptionStatus`. Appends a `_no_...`
 * suffix to the base status whenever the store's `cart_display_config` turns
 * off the date field that status would otherwise show, so `card.tsx` can
 * pick a message that doesn't reference a hidden date. `will_end_after_payment`
 * is the one status with two dates, hence the compound case: turning off both
 * leaves nothing to distinguish it from a plain active subscription, so it
 * collapses to `next_payment_no_nextdate` rather than growing a
 * `_no_nextdate_no_enddate` status nothing else has.
 *
 * Takes `CartDisplayConfig` rather than the whole settings resource v1's
 * version takes -- this port only ever has the four subscription flags in
 * hand (see `cart-display-config.ts`), not the full `customer_portal_settings`
 * shape, and the extra fields on that resource are unrelated to subscriptions.
 *
 * Deviates from v1 in one respect: a date `getSubscriptionStatus` accepted as
 * a valid *instant* (e.g. a calendar day that doesn't exist, like Feb 30,
 * which `Date` silently rolls into March) can still fail `toCalendarDate`'s
 * stricter validation. v1 has no fallback for that and would render the date
 * as blank; this treats an unformattable date the same as a configured-off
 * one, so the message degrades to the date-free string instead.
 */
export function getExtendedSubscriptionStatus(
  data: StatusInput | null,
  cartDisplayConfig: CartDisplayConfig | null | undefined,
): ExtendedSubscriptionStatus | null {
  if (data === null) return null;

  const status = getSubscriptionStatus(data);
  if (status === null) return null;

  const canShow = (raw: string | null, configured: boolean) =>
    configured && toCalendarDate(raw) !== null;

  const showStartDate = canShow(
    data.start_date,
    cartDisplayConfig?.show_sub_startdate ?? true,
  );
  const showNextDate = canShow(
    data.next_transaction_date,
    cartDisplayConfig?.show_sub_nextdate ?? true,
  );
  const showEndDate = canShow(
    data.end_date,
    cartDisplayConfig?.show_sub_enddate ?? true,
  );

  if (status === "failed_and_ended" && !showEndDate) {
    return "failed_and_ended_no_enddate";
  }
  if (status === "next_payment" && !showNextDate) {
    return "next_payment_no_nextdate";
  }
  if (status === "will_start" && !showStartDate) {
    return "will_start_no_startdate";
  }
  if (status === "will_end" && !showEndDate) return "will_end_no_enddate";
  if (status === "ended" && !showEndDate) return "ended_no_enddate";

  if (status === "will_end_after_payment") {
    if (!showEndDate && !showNextDate) return "next_payment_no_nextdate";
    if (!showNextDate) return "will_end_after_payment_no_nextdate";
    if (!showEndDate) return "will_end_after_payment_no_enddate";
  }

  return status;
}
