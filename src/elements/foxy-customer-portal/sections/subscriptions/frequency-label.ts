import type { MessageDescriptor } from "react-intl";
import { messages } from "../../messages";
import { parseFrequencyParts } from "./price-line";

/**
 * The same four units `price-line.ts` reads, mapped to standalone labels
 * rather than price suffixes: "Monthly", not "/mo".
 *
 * Two readings of one string, so both go through `parseFrequencyParts` --
 * a card reading "$42.00/wk" and a Select reading "Weekly" must never
 * disagree about what `"1w"` means.
 */
const LABEL_MESSAGES: Record<string, MessageDescriptor | undefined> = {
  d: messages.subscriptionFrequencyDaily,
  w: messages.subscriptionFrequencyWeekly,
  m: messages.subscriptionFrequencyMonthly,
  y: messages.subscriptionFrequencyYearly,
};

export type FrequencyLabel = { message: MessageDescriptor; count: number };

/**
 * The message and count for a frequency's human-readable label, or `null`
 * when the string is not one this can read.
 *
 * `null` is a real answer, not a failure: the caller falls back to showing
 * the raw `frequency` unchanged. That mirrors `parseFrequency`'s rule --
 * naming the wrong billing period is worse than showing API syntax, because
 * the customer cannot tell the invented one is wrong.
 *
 * `".5m"` is special-cased ahead of the unit table. It is Foxy's twice-a-month
 * frequency, and the generic plural path would render it "Every 0.5 months",
 * which reads like a bug rather than a billing period.
 */
export function frequencyLabel(frequency: string): FrequencyLabel | null {
  const parts = parseFrequencyParts(frequency);
  if (!parts) return null;

  if (parts.unit === "m" && parts.count === 0.5) {
    return { message: messages.subscriptionFrequencyTwiceMonthly, count: 1 };
  }

  const message = LABEL_MESSAGES[parts.unit];
  return message ? { message, count: parts.count } : null;
}
