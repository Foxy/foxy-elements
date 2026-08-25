import type { MessageDescriptor } from "react-intl";
import { messages } from "../../messages";

/**
 * The four period units Foxy's `frequency` string can carry. The API sends a
 * count and a unit run together -- `"1m"`, `"4w"`, `"1y"` -- which the card
 * renders as a suffix on the price: `"$38.50/4 weeks"`.
 */
const UNIT_MESSAGES: Record<string, MessageDescriptor | undefined> = {
  d: messages.subscriptionPricePerDay,
  w: messages.subscriptionPricePerWeek,
  m: messages.subscriptionPricePerMonth,
  y: messages.subscriptionPricePerYear,
};

export type FrequencyParts = { message: MessageDescriptor; count: number };

/**
 * Splits a `frequency` into the message and count needed to render its price
 * suffix, or `null` when the string is not one this can read.
 *
 * `null` is a real answer, not a failure: the caller falls back to the bare
 * price. Foxy also accepts fractional counts (`".5m"`, twice a month), so the
 * pattern allows a decimal rather than assuming an integer -- ICU routes a
 * non-integer to the `other` plural branch, which reads correctly ("0.5
 * months"). A frequency this cannot parse must never invent a suffix: showing
 * the wrong billing period is worse than showing none.
 */
export function parseFrequency(frequency: string): FrequencyParts | null {
  const match = /^(\d*\.?\d+)([dwmy])$/.exec(frequency.trim());
  if (!match) return null;

  const count = Number(match[1]);
  if (!Number.isFinite(count) || count <= 0) return null;

  const message = UNIT_MESSAGES[match[2]];
  return message ? { message, count } : null;
}
