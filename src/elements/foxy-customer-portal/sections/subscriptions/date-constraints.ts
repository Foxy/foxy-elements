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

/**
 * `react-day-picker`, when no `timeZone` option is set on `DayPicker`, builds
 * every calendar cell as local midnight (`new Date(year, monthIndex, date)`)
 * and matches disable-matchers against local calendar days (`isSameDay`,
 * `differenceInCalendarDays`, `date.getDay()`). This module targets that
 * default local-day contract throughout. If a caller ever configures
 * `DayPicker` with a `timeZone`, every date built here has to change with it.
 * Task 6 wires up the picker and must not set `timeZone`.
 */
function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Rounds down to local midnight of the same calendar day. */
function toLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
 *
 * The result is rounded down to local midnight so it lines up with
 * DayPicker's local-day cells. That rounding is not DST-safe: adding raw
 * milliseconds and then flooring to local midnight is one-sided across a
 * fall-back transition, so a window that straddles one can land one calendar
 * day earlier than intended (e.g. America/New_York, Oct 25 + 14d truncates to
 * Nov 7, not Nov 8). That error is bounded to one day, at most twice a year,
 * and is smaller than the imprecision `getTimeFromFrequency` already accepts
 * (a "month" is 31 days) — so it is left as is rather than special-cased.
 */
function offsetBy(from: Date, frequency: string): Date | undefined {
  try {
    return toLocalMidnight(
      new Date(from.getTime() + getTimeFromFrequency(frequency)),
    );
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
    disabled.push((date: Date) => !allowed.has(date.getDate()));
  }

  return { startMonth, endMonth, disabled };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Formats a picker date as the API's `YYYY-MM-DD`, in local terms.
 *
 * react-day-picker (no `timeZone` set) hands back local-midnight dates, so
 * `toISOString()` would convert to UTC and move the calendar day for any
 * customer east of UTC — sending a date one day before the one they clicked.
 */
export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
