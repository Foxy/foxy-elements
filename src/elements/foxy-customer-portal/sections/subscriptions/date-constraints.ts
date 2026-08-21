import { getTimeFromFrequency, type Constraints } from "@foxy.io/sdk/customer";

/** A react-day-picker matcher. Kept local so this module owns its own contract. */
export type Matcher =
  | Date
  | { before: Date }
  | { after: Date }
  | { from: Date; to: Date }
  | { dayOfWeek: number[] }
  | ((date: Date) => boolean);

export type DatePickerBounds = {
  startMonth?: Date;
  endMonth?: Date;
  disabled: Matcher[];
};

/** Every weekday as `Date.getDay()` numbers them: 0 = Sunday. */
const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

/** Foxy numbers weekdays 1-7 with Monday first; `Date.getDay()` is 0-6 with Sunday first. */
function toJsWeekday(foxyDay: number): number {
  return foxyDay === 7 ? 0 : foxyDay;
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/**
 * Offsets `from` by a frequency, or returns undefined when the frequency is
 * unusable.
 *
 * `getTimeFromFrequency` is approximate by its own documentation — a month is
 * 31 days, a year 365. That is fine for a picker boundary, which the API
 * re-validates on save, and would not be fine for computing a billing date.
 * It throws on malformed input, and a store with one bad rule must not blank
 * the whole dialog.
 */
function offsetBy(from: Date, frequency: string): Date | undefined {
  try {
    return new Date(from.getTime() + getTimeFromFrequency(frequency));
  } catch {
    return undefined;
  }
}

/**
 * Translates the store's next-payment-date rules into react-day-picker props.
 *
 * The allow/disable inversion is the part to be careful with: Foxy states which
 * days are *allowed*, react-day-picker takes matchers for what is *disabled*.
 * Getting it backwards silently permits dates the store forbade.
 */
export function toDatePickerBounds(
  constraints: Constraints,
  from: Date = new Date(),
): DatePickerBounds {
  const disabled: Matcher[] = [];

  const startMonth = constraints.min
    ? offsetBy(from, constraints.min)
    : undefined;
  const endMonth = constraints.max
    ? offsetBy(from, constraints.max)
    : undefined;

  if (startMonth) disabled.push({ before: startMonth });
  if (endMonth) disabled.push({ after: endMonth });

  for (const entry of constraints.disallowedDates ?? []) {
    const [start, end] = entry.split("..");
    if (end) disabled.push({ from: parseDate(start), to: parseDate(end) });
    else disabled.push(parseDate(start));
  }

  if (constraints.allowedDaysOfWeek?.length) {
    const allowed = constraints.allowedDaysOfWeek.map(toJsWeekday);
    disabled.push({
      dayOfWeek: ALL_WEEKDAYS.filter((day) => !allowed.includes(day)),
    });
  }

  if (constraints.allowedDaysOfMonth?.length) {
    const allowed = new Set(constraints.allowedDaysOfMonth);
    disabled.push((date: Date) => !allowed.has(date.getUTCDate()));
  }

  return { startMonth, endMonth, disabled };
}
