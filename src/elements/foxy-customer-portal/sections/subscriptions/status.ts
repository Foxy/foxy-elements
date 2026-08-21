import type { Rels } from "@foxy.io/sdk/customer";
import type { Resource } from "@foxy.io/sdk/core";

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
